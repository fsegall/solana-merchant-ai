import { useMemo } from 'react';
import { useClient, useAccount } from '@/contexts/ParaProvider';
import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react';
import { ParaSolanaWeb3Signer } from '@getpara/solana-web3.js-v1-integration';
import { Transaction, VersionedTransaction, PublicKey } from '@solana/web3.js';

/**
 * useParaSolanaSigner Hook
 * 
 * Unified hook that works with both:
 * 1. Para embedded wallets (Passkeys)
 * 2. External wallets (Phantom, Solflare, etc.)
 * 
 * Based on official Para SDK documentation:
 * https://docs.getpara.com/v2/react/guides/web3-operations/solana/setup-libraries
 */
export const useParaSolanaSigner = () => {
  const para = useClient();
  const { isConnected: isParaConnected } = useAccount();
  const { connection } = useConnection();

  // Solana Wallet Adapter hooks (for external wallets)
  const {
    publicKey: externalPublicKey,
    sendTransaction: externalSendTransaction,
    signTransaction: externalSignTransaction,
    signAllTransactions: externalSignAllTransactions,
  } = useSolanaWallet();

  // Create Para Solana signer if Para wallet is connected
  const paraSigner = useMemo(() => {
    if (!para || !isParaConnected || !connection) {
      return null;
    }
    
    const wallets = para.getWalletsByType({ type: 'Solana' });
    if (!wallets || wallets.length === 0) {
      return null;
    }
    
    return new ParaSolanaWeb3Signer(para, connection);
  }, [para, isParaConnected, connection]);

  // Determine which wallet is active
  const isUsingPara = Boolean(paraSigner);
  const isUsingExternal = Boolean(externalPublicKey);

  // Get public key from either Para or external wallet
  const publicKey = useMemo(() => {
    if (isUsingPara && paraSigner) {
      // Get public key from Para wallet
      const wallets = para?.getWalletsByType({ type: 'Solana' });
      if (wallets && wallets.length > 0) {
        try {
          return new PublicKey(wallets[0].address);
        } catch (e) {
          console.error('Invalid Para wallet address:', e);
          return null;
        }
      }
    }
    return externalPublicKey;
  }, [isUsingPara, paraSigner, para, externalPublicKey]);

  /**
   * Sign and send a transaction
   * Works with both Para and external wallets
   */
  const sendTransaction = async (
    transaction: Transaction | VersionedTransaction,
    connection: any,
    options?: any
  ): Promise<string> => {
    if (isUsingPara && paraSigner) {
      // Use Para signer for embedded wallets
      console.log('🔐 Signing with Para embedded wallet (Passkey)');
      
      // Para SDK handles signing and sending
      const signedTx = await paraSigner.signTransaction(transaction as Transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      return signature;
    } else if (externalPublicKey && externalSendTransaction) {
      // Use external wallet (Phantom, Solflare, etc.)
      console.log('🔐 Signing with external wallet');
      return await externalSendTransaction(transaction as Transaction, connection, options);
    } else {
      throw new Error('No wallet connected');
    }
  };

  /**
   * Sign a transaction without sending
   */
  const signTransaction = async (
    transaction: Transaction | VersionedTransaction
  ): Promise<Transaction | VersionedTransaction> => {
    if (isUsingPara && paraSigner) {
      console.log('🔐 Signing transaction with Para');
      return await paraSigner.signTransaction(transaction as Transaction);
    } else if (externalSignTransaction) {
      console.log('🔐 Signing transaction with external wallet');
      return await externalSignTransaction(transaction as Transaction);
    } else {
      throw new Error('No wallet connected');
    }
  };

  /**
   * Sign multiple transactions
   */
  const signAllTransactions = async (
    transactions: (Transaction | VersionedTransaction)[]
  ): Promise<(Transaction | VersionedTransaction)[]> => {
    if (isUsingPara && paraSigner) {
      console.log('🔐 Signing multiple transactions with Para');
      // Sign each transaction sequentially
      const signedTxs = [];
      for (const tx of transactions) {
        const signed = await paraSigner.signTransaction(tx as Transaction);
        signedTxs.push(signed);
      }
      return signedTxs;
    } else if (externalSignAllTransactions) {
      console.log('🔐 Signing multiple transactions with external wallet');
      return await externalSignAllTransactions(transactions as Transaction[]);
    } else {
      throw new Error('No wallet connected');
    }
  };

  /**
   * Get wallet type for UI display
   */
  const walletType = useMemo(() => {
    if (isUsingPara) return 'para-passkey';
    if (isUsingExternal) return 'external';
    return 'none';
  }, [isUsingPara, isUsingExternal]);

  /**
   * Check if wallet is connected (any type)
   */
  const isConnected = Boolean(publicKey);

  return {
    // Wallet info
    publicKey,
    isConnected,
    walletType,
    walletAddress: publicKey?.toString(),
    
    // Transaction signing
    sendTransaction,
    signTransaction,
    signAllTransactions,
    
    // Connection
    connection,
    
    // Helper booleans
    isUsingParaWallet: isUsingPara,
    isUsingExternalWallet: isUsingExternal,
  };
};
