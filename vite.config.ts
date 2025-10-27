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
      'process/': path.resolve(__dirname, 'node_modules/process/browser.js'),
    },
  },
  define: {
    // Define globals for browser compatibility
    global: 'globalThis',
    'process.env': '{}',
    'process.browser': 'true',
    'process.version': '"v18.0.0"',
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
      output: {
        // Fix for "exports is not defined" error
        inlineDynamicImports: false,
        format: 'es',
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      ignoreDynamicRequires: true,
      // Fix CommonJS modules in browser
      esmExternals: true,
    },
  },
  optimizeDeps: {
    include: [
      // Force pre-bundle to fix ESM issues
      'qrcode',
      'bs58',
      'buffer',
      'process',
    ],
    esbuildOptions: {
      // Node.js globals to browser compatibility
      define: {
        global: 'globalThis',
        'process.browser': 'true',
        'process.version': '"v18.0.0"',
      },
    },
  },
}));
