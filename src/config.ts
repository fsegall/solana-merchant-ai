/**
 * Centralized configuration for the application
 * Handles both development (localhost) and production environments
 */

// Get Supabase configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Construct Edge Functions URL
export const EDGE_FUNCTIONS_BASE = SUPABASE_URL 
  ? `${SUPABASE_URL}/functions/v1` 
  : 'http://127.0.0.1:54321/functions/v1'; // Fallback to localhost for development

// Solana Configuration
export const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
export const MERCHANT_RECIPIENT = import.meta.env.VITE_MERCHANT_RECIPIENT || '';
export const ENABLE_ASSISTED_CHARGE = (import.meta.env.VITE_ENABLE_ASSISTED_CHARGE || 'false') === 'true';

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 Configuration:', {
    SUPABASE_URL: SUPABASE_URL ? `${SUPABASE_URL.slice(0, 30)}...` : 'NOT SET',
    EDGE_FUNCTIONS_BASE,
    SOLANA_NETWORK,
    MERCHANT_RECIPIENT: MERCHANT_RECIPIENT ? 'SET' : 'NOT SET',
    ENABLE_ASSISTED_CHARGE,
  });
}

// Validate required configuration
if (!SUPABASE_URL) {
  console.error('⚠️ VITE_SUPABASE_URL is not set. Please configure your environment variables.');
}

if (!SUPABASE_ANON_KEY) {
  console.error('⚠️ VITE_SUPABASE_ANON_KEY is not set. Please configure your environment variables.');
}

