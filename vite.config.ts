import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Plugin para remover exports problemáticos do bundle final
const removeExportsPlugin = () => ({
  name: 'remove-exports',
  enforce: 'post',
  generateBundle(options, bundle) {
    Object.keys(bundle).forEach(fileName => {
      const chunk = bundle[fileName];
      if (chunk.type === 'chunk' && chunk.code) {
        // Remover declarações problemáticas de exports
        chunk.code = chunk.code
          .replace(/var exports;/g, '')
          .replace(/exports = /g, '')
          .replace(/typeof exports !== "undefined"/g, 'false')
          .replace(/typeof exports === "undefined"/g, 'true');
      }
    });
  },
  renderChunk(code, chunk) {
    // Remover exports durante a renderização
    return code
      .replace(/var exports;/g, '')
      .replace(/typeof exports !== "undefined"/g, 'false')
      .replace(/typeof exports === "undefined"/g, 'true');
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    removeExportsPlugin()
  ].filter(Boolean),
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
        format: 'es',
        manualChunks: {
          'vendor-solana': ['@solana/web3.js', '@solana/wallet-adapter-base', '@solana/wallet-adapter-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      dynamicRequireTargets: [],
    },
    target: 'esnext',
  },
}));
