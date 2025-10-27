import { useEffect, useState } from 'react';
import { PublicKey, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import BigNumber from 'bignumber.js';
import { useSolanaPay, PaymentRequest } from '@/hooks/useSolanaPay';
import { useParaSolanaSigner } from '@/hooks/useParaSolanaSigner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, RefreshCw, CheckCircle2, Clock, Wallet, Fingerprint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBrzMint } from '@/lib/solana-config';
import { DebugPanel } from '@/components/DebugPanel';
import { TokenInfo, getDefaultPaymentToken } from '@/lib/tokens';
import { useAutoSwap } from '@/hooks/useAutoSwap';

export type PaymentStatus = 'generating' | 'active' | 'expired' | 'paid' | 'error';

interface SolanaPayQRProps {
  recipient: string;
  amount: number; // Amount in BRL (will be converted)
  existingReference?: string; // Solana PublicKey reference for payment
  receiptRef?: string; // Invoice ref (REFXXXX) for validation
  label?: string;
  message?: string;
  onPaymentConfirmed?: (txHash: string) => void;
  onExpired?: () => void;
  expirationMinutes?: number;
  paymentToken?: TokenInfo; // Token customer will use to pay (defaults to tBRZ/BRZ)
  settlementToken?: TokenInfo; // Token merchant wants to receive (for Jupiter swap)
  autoSwapEnabled?: boolean; // Whether to enable Jupiter auto-swap
}

export function SolanaPayQR({
  recipient,
  amount,
  existingReference,
  receiptRef,
  label,
  message,
  onPaymentConfirmed,
  onExpired,
  expirationMinutes = 10,
  paymentToken,
  settlementToken,
  autoSwapEnabled = false,
}: SolanaPayQRProps) {
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('generating');
  const [timeRemaining, setTimeRemaining] = useState(expirationMinutes * 60);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  const { createPaymentRequest, validatePayment, isGenerating, error } = useSolanaPay();
  const { toast } = useToast();
  const { publicKey, sendTransaction, connection, walletType, isUsingParaWallet } = useParaSolanaSigner();
  const { processAutoSwap } = useAutoSwap();

  const generateQR = async () => {
    setStatus('generating');
    setTimeRemaining(expirationMinutes * 60);

    try {
      const recipientPubkey = new PublicKey(recipient);
      const amountBigNumber = new BigNumber(amount);
      
      // Use provided payment token or fallback to default (tBRZ/BRZ)
      const tokenToUse = paymentToken || getDefaultPaymentToken();
      const tokenMint = new PublicKey(tokenToUse.mint);

      console.log('🎫 Generating Solana Pay QR:', {
        recipient: recipient,
        amount: amount,
        paymentToken: tokenToUse.symbol,
        tokenMint: tokenMint.toString(),
        autoSwap: autoSwapEnabled,
        settlementToken: settlementToken?.symbol,
        existingReference: existingReference,
      });

      // If existingReference is provided (from invoice), use it directly
      // Otherwise generate a new one via createPaymentRequest
      let request: PaymentRequest;
      
      if (existingReference) {
        console.log('✅ Using existing reference from invoice:', existingReference);
        // Create payment request with the existing reference
        const existingRefPubkey = new PublicKey(existingReference);
        const url = new URL(`solana:${recipient}`);
        url.searchParams.set('amount', amountBigNumber.toString());
        url.searchParams.set('spl-token', tokenMint.toString());
        url.searchParams.set('reference', existingReference);
        if (label) url.searchParams.set('label', label);
        if (message) url.searchParams.set('message', message);
        
        // Generate QR code from URL
        const qr = await import('@solana/pay').then(m => m.createQR(url));
        const qrBlob = await qr.getRawData('png');
        if (!qrBlob) throw new Error('Failed to generate QR code');
        
        const qrDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(qrBlob);
        });

        request = {
          reference: existingRefPubkey,
          url,
          qrCode: qrDataUrl,
        };
      } else {
        // Generate new reference
        console.log('🆕 Generating new reference');
        const newRequest = await createPaymentRequest({
          recipient: recipientPubkey,
          amount: amountBigNumber,
          label: label || `Payment of R$ ${amount.toFixed(2)}`,
          message: message || 'Thank you for your payment',
          splToken: tokenMint,
        });
        if (!newRequest) throw new Error('Failed to create payment request');
        request = newRequest;
      }

      setPaymentRequest(request);
      setStatus('active');
      // Use receiptRef (REFXXXX) for polling, not Solana PublicKey
      const refForValidation = receiptRef || request.reference.toString();
      console.log('🔍 Will poll with ref:', refForValidation);
      startPolling(refForValidation);
    } catch (err) {
      console.error('Failed to generate QR:', err);
      setStatus('error');
    }
  };

  const startPolling = (reference: string) => {
    // Clear existing interval
    if (pollInterval) {
      clearInterval(pollInterval);
    }

    // Poll every 3 seconds
    const interval = setInterval(async () => {
      const result = await validatePayment(reference);
      
      if (result && result.status === 'confirmed' && result.tx) {
        setStatus('paid');
        clearInterval(interval);
        onPaymentConfirmed?.(result.tx);
        toast({
          title: "Payment Confirmed!",
          description: `Transaction: ${result.tx.slice(0, 8)}...`,
        });
      }
    }, 3000);

    setPollInterval(interval);
  };

  const copyToClipboard = async () => {
    if (!paymentRequest) return;
    
    try {
      await navigator.clipboard.writeText(paymentRequest.url.toString());
      toast({
        title: "Link Copied!",
        description: "Payment link copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (status !== 'active') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setStatus('expired');
          if (pollInterval) clearInterval(pollInterval);
          onExpired?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, pollInterval, onExpired]);

  // Initial generation
  useEffect(() => {
    generateQR();
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    if (paymentRequest) {
      navigator.clipboard.writeText(paymentRequest.url.toString());
      toast({
        title: "Link copiado!",
        description: "Cole o link no Phantom para fazer o pagamento",
      });
    }
  };

  const handleOpenPhantom = () => {
    if (paymentRequest) {
      // Convert solana: URL to deeplink that triggers wallet apps
      // This format works for Phantom, Backpack, and other Solana wallets
      const walletUrl = paymentRequest.url.toString().replace(/^solana:/, 'https://phantom.app/ul/');
      window.open(walletUrl, '_blank');
    }
  };

  const handlePayWithWallet = async () => {
    console.log('🚀 handlePayWithWallet started', { publicKey: publicKey?.toString(), hasPaymentRequest: !!paymentRequest });
    
    if (!publicKey || !paymentRequest) {
      toast({
        title: "Wallet não conectada",
        description: "Por favor, conecte sua wallet primeira",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      console.log('🔧 Creating recipient pubkey from:', recipient);
      const recipientPubkey = new PublicKey(recipient);
      console.log('✅ Recipient pubkey created:', recipientPubkey.toString());
      
      // Use provided payment token or fallback to default
      const tokenToUse = paymentToken || getDefaultPaymentToken();
      console.log('🪙 Using token:', tokenToUse);
      
      const tokenMint = new PublicKey(tokenToUse.mint);
      console.log('✅ Token mint created:', tokenMint.toString());

      if (!tokenMint) {
        throw new Error('Payment token not configured');
      }

      console.log('💰 Sending payment:', {
        from: publicKey.toString(),
        to: recipient,
        amount: amount,
        token: tokenToUse.symbol,
        mint: tokenMint.toString(),
        reference: paymentRequest.reference.toString(),
      });

      // Get ATAs for the payment token
      console.log('🔍 Getting ATAs...');
      const fromAta = await getAssociatedTokenAddress(tokenMint, publicKey);
      console.log('✅ From ATA:', fromAta.toString());
      
      const toAta = await getAssociatedTokenAddress(tokenMint, recipientPubkey);
      console.log('✅ To ATA:', toAta.toString());

      // Convert amount to token units (using token's decimals)
      const tokenAmount = Math.floor(amount * Math.pow(10, tokenToUse.decimals));

      console.log('🔢 Token amount (minor units):', tokenAmount);

      // Get recent blockhash
      console.log('🔗 Getting recent blockhash...');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      console.log('✅ Blockhash:', blockhash);

      // Create transaction
      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      });
      
      console.log('🔨 Building transaction:', {
        fromAta: fromAta.toString(),
        toAta: toAta.toString(),
        amount: tokenAmount,
        tokenMint: tokenMint?.toString(),
        feePayer: publicKey.toString(),
        blockhash: blockhash.substring(0, 8) + '...',
      });

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          fromAta,
          toAta,
          publicKey,
          tokenAmount,
          [],
          undefined
        )
      );
      console.log('✅ Transfer instruction added');

      // Add reference as a memo instruction (read-only account key)
      // This allows validate-payment to find the transaction via getSignaturesForAddress
      console.log('📝 Adding memo instruction with reference:', paymentRequest.reference.toString());
      transaction.add(
        new TransactionInstruction({
          keys: [{ pubkey: paymentRequest.reference, isSigner: false, isWritable: false }],
          data: Buffer.alloc(0),
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), // Memo program
        })
      );
      console.log('✅ Memo instruction added');

      // Verify ATAs exist and have sufficient balance
      console.log('🔍 Verifying ATAs...');
      try {
        const fromAtaInfo = await connection.getAccountInfo(fromAta);
        console.log('📋 From ATA info:', {
          exists: !!fromAtaInfo,
          owner: fromAtaInfo?.owner.toString(),
          lamports: fromAtaInfo?.lamports,
        });

        const toAtaInfo = await connection.getAccountInfo(toAta);
        console.log('📋 To ATA info:', {
          exists: !!toAtaInfo,
          owner: toAtaInfo?.owner.toString(),
          lamports: toAtaInfo?.lamports,
        });

        // If recipient ATA doesn't exist, we need to create it first
        if (!toAtaInfo) {
          console.log('⚠️ Recipient ATA does not exist! Need to create it first.');
          // For now, we'll let the transaction fail and show this error
          // In production, you'd want to add a createAssociatedTokenAccount instruction
        }

        // Check token balance
        if (fromAtaInfo) {
          const fromAtaBalance = await connection.getTokenAccountBalance(fromAta);
          console.log('💰 From ATA balance:', {
            amount: fromAtaBalance.value.amount,
            uiAmount: fromAtaBalance.value.uiAmount,
            decimals: fromAtaBalance.value.decimals,
          });
          
          if (BigInt(fromAtaBalance.value.amount) < BigInt(tokenAmount)) {
            throw new Error(`Insufficient balance. Have ${fromAtaBalance.value.uiAmount}, need ${tokenAmount / Math.pow(10, tokenToUse.decimals)}`);
          }
        }
      } catch (verifyError: any) {
        console.error('❌ ATA verification failed:', verifyError);
        if (verifyError.message?.includes('Insufficient balance')) {
          throw verifyError;
        }
        // Continue even if verification fails (account might not exist yet)
      }

      console.log('📤 Sending transaction with', transaction.instructions.length, 'instructions');
      console.log('📋 Transaction details:', {
        feePayer: transaction.feePayer?.toString(),
        recentBlockhash: transaction.recentBlockhash,
        signatures: transaction.signatures.length,
      });
      
      let signature: string;
      try {
        // Serialize to see the transaction bytes
        const serialized = transaction.serialize({ requireAllSignatures: false });
        console.log('📦 Transaction serialized:', serialized.length, 'bytes');
        
        // Send transaction
        signature = await sendTransaction(transaction, connection);
        console.log('✅ Transaction sent:', signature);
      } catch (txError: any) {
        console.error('❌ Transaction send failed:', {
          message: txError.message,
          name: txError.name,
          logs: txError.logs,
          stack: txError.stack,
          error: txError,
        });
        
        // Try to get more details from the error
        if (txError.logs) {
          console.error('📜 Transaction logs:', txError.logs);
        }
        
        throw txError;
      }

      toast({
        title: "Pagamento enviado!",
        description: "Aguardando confirmação on-chain...",
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      console.log('✅ Transaction confirmed:', signature);
      
      setStatus('paid');
      if (onPaymentConfirmed) {
        onPaymentConfirmed(signature);
      }

    } catch (err) {
      console.error('❌ Payment error:', err);
      toast({
        title: "Erro no pagamento",
        description: err instanceof Error ? err.message : 'Falha ao enviar transação',
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error || 'Failed to generate payment QR code'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Solana Pay</span>
          {status === 'active' && (
            <span className="flex items-center text-sm font-normal text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeRemaining)}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Scan the QR code with your Solana wallet
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center gap-4">
        {status === 'generating' && (
          <div className="flex flex-col items-center gap-2 py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating QR code...</p>
          </div>
        )}

        {paymentRequest && status === 'active' && (
          <>
            <img
              src={paymentRequest.qrCode}
              alt="Payment QR Code"
              className="w-64 h-64 border-4 border-border rounded-lg"
            />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                R$ {amount.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {message || label}
              </p>
            </div>
          </>
        )}

        {status === 'paid' && (
          <div className="flex flex-col items-center gap-2 py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <p className="text-lg font-semibold text-green-600">Payment Confirmed!</p>
          </div>
        )}

        {status === 'expired' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-lg font-semibold text-destructive">QR Code Expired</p>
            <Button onClick={generateQR}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New QR
            </Button>
          </div>
        )}
      </CardContent>
      
      {paymentRequest && status === 'active' && (
        <CardFooter className="flex flex-col gap-2">
          {/* Primary action: Pay with connected wallet (desktop) */}
          {publicKey ? (
            <Button
              variant="default"
              className="w-full"
              onClick={handlePayWithWallet}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  {isUsingParaWallet ? (
                    <Fingerprint className="w-4 h-4 mr-2" />
                  ) : (
                    <Wallet className="w-4 h-4 mr-2" />
                  )}
                  {isUsingParaWallet ? 'Pagar com Passkey' : 'Pagar com Wallet Conectada'}
                </>
              )}
            </Button>
          ) : (
            <Alert>
              <AlertDescription className="text-sm">
                💡 <strong>Desktop:</strong> Conecte sua wallet ou use Passkeys para pagar com um clique!
              </AlertDescription>
            </Alert>
          )}
          
          {/* Secondary actions */}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyLink}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Link
            </Button>
            <Button
              variant="outline"
              onClick={generateQR}
              disabled={isGenerating}
              className="px-3"
              title="Regenerar QR"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Info: How to pay */}
          <Alert className="border-primary/20 bg-primary/5">
            <AlertDescription className="text-xs">
              📱 <strong>Mobile:</strong> Abra Phantom → Scanner → Escaneie o QR<br/>
              💻 <strong>Desktop:</strong> Escaneie com o app Phantom ou clique "Pagar com Wallet"
            </AlertDescription>
          </Alert>
          
          <p className="text-xs text-muted-foreground text-center w-full">
            {publicKey 
              ? "💳 Pagamento direto ativo"
              : "📱 Mobile: Escaneie o QR · 💻 Desktop: Conecte wallet"
            }
          </p>
        </CardFooter>
      )}
      
      {/* Debug panel - show in development */}
      {import.meta.env.DEV && paymentRequest && (
        <div className="mt-4">
          <DebugPanel
            paymentUrl={paymentRequest.url.toString()}
            reference={paymentRequest.reference.toString()}
            amount={amount}
          />
        </div>
      )}
    </Card>
  );
}

