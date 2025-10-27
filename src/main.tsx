import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import App from "./App.tsx";
import "./index.css";

// Polyfills for browser compatibility (required by Para SDK)
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.global = window;
  
  // Criar process como objeto ao invés de importar
  if (!window.process) {
    window.process = {
      env: {},
      browser: true,
      version: 'v18.0.0',
    } as any;
  }
}

createRoot(document.getElementById("root")!).render(<App />);
