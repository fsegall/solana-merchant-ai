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
  // Get Para API key from environment
  const paraApiKey = import.meta.env.VITE_PARA_API_KEY || 'beta_YOUR_API_KEY_GOES_HERE';
  
  // Get Helius RPC URL from environment
  const heliusApiKey = import.meta.env.VITE_HELIUS_API_KEY || '';
  const network = import.meta.env.VITE_SOLANA_CLUSTER || 'devnet';
  
  // Construct Helius RPC endpoint
  const heliusEndpoint = heliusApiKey 
    ? `https://${network}.helius-rpc.com/?api-key=${heliusApiKey}`
    : `https://api.${network}.solana.com`;

  return (
    <QueryClientProvider client={paraQueryClient}>
      <ParaSDKProvider
        paraClientConfig={{
          env: Environment.BETA, // Use Environment.PROD for production
          apiKey: paraApiKey,
          disableAutoSessionKeepAlive: false, // Enable automatic session keep-alive
          disableCosmosConnector: true, // Disable Cosmos - Solana-only
          disableEvmConnector: true, // Disable EVM - Solana-only
        }}
        externalWalletConfig={{
          appName: 'Solana Merchant AI',
          wallets: ['PHANTOM', 'SOLFLARE', 'BACKPACK'],
          solanaConnector: {
            config: {
              endpoint: heliusEndpoint,
              // You can also specify commitment level
              // commitment: 'confirmed',
            },
          },
          // WalletConnect project ID (dummy for development, prevents warning)
          walletConnect: {
            projectId: '2c4b1b6d8e3a4f5c9d7e8f1a2b3c4d5e',
          },
        }}
        paraModalConfig={{
          // Solana-only mode
          enabledChains: ['SOLANA'],
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
          appDescription: 'AI-powered POS with multi-token payments and automated settlement',
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


