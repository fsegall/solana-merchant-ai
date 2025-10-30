import { FC, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParaProvider as ParaSDKProvider, Environment } from '@getpara/react-sdk';
import '@getpara/react-sdk/styles.css';

// Create a separate QueryClient for Para SDK
const paraQueryClient = new QueryClient();

interface ParaProviderProps {
  children: ReactNode;
}

/**
 * Para SDK Provider for Solana Passkeys Integration
 * Enables passwordless authentication and embedded wallets using Passkeys
 * 
 * Features:
 * - Passkey authentication (Face ID, Touch ID, Windows Hello, etc.)
 * - Embedded Solana wallets (no extension needed)
 * - Seamless transaction signing
 * - Integration with Helius RPC for optimal performance
 */
export const ParaProvider: FC<ParaProviderProps> = ({ children }) => {
  // Get Para API key and environment from environment variables
  const paraApiKey = import.meta.env.VITE_PARA_API_KEY || '';
  const paraEnvRaw = (import.meta.env.VITE_PARA_ENV || 'beta').toLowerCase();
  const paraEnv: Environment =
    paraEnvRaw === 'prod' || paraEnvRaw === 'production'
      ? Environment.PROD
      : paraEnvRaw === 'dev' || paraEnvRaw === 'development'
      ? Environment.DEV
      : Environment.BETA;
  
  // Get Helius RPC URL from environment
  const heliusApiKey = import.meta.env.VITE_HELIUS_API_KEY || '';
  const network = import.meta.env.VITE_SOLANA_CLUSTER || 'devnet';
  
  // Construct Helius RPC endpoint
  const heliusEndpoint = heliusApiKey 
    ? `https://${network}.helius-rpc.com/?api-key=${heliusApiKey}`
    : `https://api.${network}.solana.com`;

  // If no API key, skip Para SDK initialization and just render children
  // This prevents the app from breaking if Para is not configured
  if (!paraApiKey || paraApiKey.trim() === '') {
    console.warn('⚠️ Para SDK: API key not configured. Passkey features will be disabled.');
    return <QueryClientProvider client={paraQueryClient}>{children}</QueryClientProvider>;
  }

  return (
    <QueryClientProvider client={paraQueryClient}>
      <ParaSDKProvider
        paraClientConfig={{
          env: paraEnv,
          apiKey: paraApiKey,
        }}
        externalWalletConfig={{
          wallets: ['PHANTOM', 'SOLFLARE', 'BACKPACK'],
          solanaConnector: {
            config: {
              chain: 'SOLANA' as any,
              endpoint: heliusEndpoint,
            },
          },
          walletConnect: {
            projectId: '2c4b1b6d8e3a4f5c9d7e8f1a2b3c4d5e',
          },
        }}
        paraModalConfig={{
          // Enable OAuth methods for easy onboarding
          oAuthMethods: ['GOOGLE'],
          // Layout configuration
          authLayout: ['AUTH:FULL', 'EXTERNAL:FULL'],
          // Enable recovery options
          recoverySecretStepEnabled: true,
          // Test mode for onramp (development)
          onRampTestMode: true,
        }}
        config={{
          appName: 'Solana Merchant AI',
        }}
      >
        {children}
      </ParaSDKProvider>
    </QueryClientProvider>
  );
};

// Re-export Para hooks for easy access
export {
  useModal,
  useAccount,
  useWallet,
  useClient,
  useSignTransaction,
  useSignMessage,
  useWalletBalance,
  useLogout,
} from '@getpara/react-sdk';


