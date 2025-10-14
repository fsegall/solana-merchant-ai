import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fingerprint, Smartphone, Shield, Zap, Check, Info, ArrowRight, LogOut } from 'lucide-react';
import { useModal, useAccount, useWallet, useLogout } from '@/contexts/ParaProvider';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

/**
 * PasskeyOnboarding Component
 * 
 * Onboarding flow for merchants using Passkeys (WebAuthn) instead of traditional wallets.
 * Benefits:
 * - No browser extensions needed
 * - Biometric authentication (Face ID, Touch ID, Windows Hello)
 * - Instant embedded wallet creation
 * - Seamless UX for non-crypto native users
 */
export const PasskeyOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const logout = useLogout();
  const [step, setStep] = useState<'intro' | 'connecting' | 'success'>('intro');

  // Debug: verificar estado de conexão
  useEffect(() => {
    console.log('🔍 PasskeyOnboarding - Estado:', {
      isConnected,
      hasWallet: !!wallet,
      walletAddress: wallet?.address,
      step
    });
  }, [isConnected, wallet, step]);

  const handleConnect = () => {
    setStep('connecting');
    openModal();
  };

  const handleContinue = () => {
    navigate('/');
  };

  const handleDisconnect = async () => {
    try {
      await logout.logoutAsync();
      toast({
        title: '👋 Desconectado',
        description: 'Você foi desconectado com sucesso',
      });
      setStep('intro');
    } catch (e) {
      console.error('Erro ao desconectar:', e);
    }
  };

  const features = [
    {
      icon: <Fingerprint className="w-6 h-6 text-blue-500" />,
      title: 'Biometric Authentication',
      description: 'Use Face ID, Touch ID, or Windows Hello - no passwords needed',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-green-500" />,
      title: 'No Extension Required',
      description: 'Works natively in your browser without any downloads',
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      title: 'Secure & Private',
      description: 'Your keys never leave your device, powered by WebAuthn',
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: 'Instant Setup',
      description: 'Create your Solana wallet in seconds with Passkeys',
    },
  ];

  if (isConnected && wallet) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-green-500/50 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Check className="w-6 h-6 text-green-500" />
              <CardTitle>Wallet Connected! 🎉</CardTitle>
            </div>
            <CardDescription>
              You're all set to start accepting crypto payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Seu endereço Solana:</p>
              <p className="text-sm font-mono break-all">{wallet.address}</p>
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your wallet is secured with Passkeys. You can access it anytime using your biometrics.
              </AlertDescription>
            </Alert>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleContinue}
                size="lg"
                className="flex-1"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Ir para o Sistema
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="lg"
                className="border-red-500/50 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (step === 'intro') {
    return (
      <Card className="border-blue-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-blue-500" />
            Welcome to Solana Merchant AI
          </CardTitle>
          <CardDescription>
            Set up your merchant wallet in seconds with Passkeys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Powered by Para + Helius:</strong> Your wallet is created using cutting-edge
              Passkey technology. It's 100% Solana-native and works with all Solana Pay apps.
            </AlertDescription>
          </Alert>

          {/* CTA Button */}
          <Button
            onClick={handleConnect}
            size="lg"
            className="w-full"
          >
            <Fingerprint className="w-5 h-5 mr-2" />
            Create Wallet with Passkeys
          </Button>

          {/* Alternative Options */}
          <div className="text-center text-sm text-muted-foreground">
            Or connect with{' '}
            <button
              onClick={() => openModal()}
              className="text-primary hover:underline"
            >
              Phantom, Solflare, or Backpack
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'connecting') {
    return (
      <Card className="border-blue-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Fingerprint className="w-6 h-6 text-blue-500" />
            </motion.div>
            Setting up your wallet...
          </CardTitle>
          <CardDescription>
            Follow the prompts from your device to authenticate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You may see a system prompt asking to create or use a Passkey. This is how your
              secure wallet is created.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return null;
};


