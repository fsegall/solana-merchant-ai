import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Polyfills for Node.js modules (required by Para SDK)
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
  define: {
    // Define global for browser compatibility
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      external: [
        // Mark Cosmos dependencies as external (not needed for Solana-only app)
        '@getpara/graz',
        '@getpara/cosmos-wallet-connectors',
        // Mark Ethereum dependencies as external (not needed for Solana-only app)
        'wagmi',
        '@wagmi/core',
        'wagmi/connectors',
        '@getpara/evm-wallet-connectors',
        '@getpara/wagmi-v2-connector',
      ],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: [
      // Force pre-bundle to fix ESM issues
      'qrcode',
      'bs58',
      'buffer',
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },
}));
