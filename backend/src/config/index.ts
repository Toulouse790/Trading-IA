/**
 * Configuration de l'application
 * Charge les variables d'environnement et expose la config
 */

import dotenv from 'dotenv';
import path from 'path';

// Charger .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Security
  apiSecretKey: process.env.API_SECRET_KEY || 'dev-secret-key',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // CORS
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(origin => origin.trim()),

  // External APIs (optionnel)
  geminiApiKey: process.env.GEMINI_API_KEY || null,
  twelveDataApiKey: process.env.TWELVE_DATA_API_KEY || null,
  finnhubApiKey: process.env.FINNHUB_API_KEY || null,

  // Supabase (optionnel)
  supabaseUrl: process.env.SUPABASE_URL || null,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || null,
};

// Validation de la config
export function validateConfig(): void {
  const required = ['databaseUrl'];

  for (const key of required) {
    if (!config[key as keyof typeof config]) {
      throw new Error(`Missing required config: ${key}. Check your .env file.`);
    }
  }

  if (config.isProd && config.apiSecretKey === 'dev-secret-key') {
    console.warn('⚠️  WARNING: Using default API_SECRET_KEY in production!');
  }
}

export default config;
