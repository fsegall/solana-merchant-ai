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
    // Define globals for browser compatibility
    global: 'globalThis',
    'process.env': '{}',
    'process.browser': 'true',
    'process.version': '"v18.0.0"',
  },
  build: {
    rollupOptions: {
      output: {
        format: 'es',
        manualChunks: {
          'vendor-solana': ['@solana/web3.js', '@solana/wallet-adapter-base', '@solana/wallet-adapter-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'esnext',
  },
}));
