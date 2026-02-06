/**
 * Trading-IA Backend
 * Point d'entrée de l'application
 *
 * API REST pour la plateforme de trading Forex avec IA
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import config, { validateConfig } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares';
import { checkDatabaseConnection, disconnectDatabase } from './services/database';

// Valider la configuration
validateConfig();

// Créer l'application Express
const app = express();

// ===========================================
// MIDDLEWARES GLOBAUX
// ===========================================

// Sécurité HTTP
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// Parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ===========================================
// ROUTES
// ===========================================

// Routes API
app.use('/api', routes);

// Route racine
app.get('/', (req, res) => {
  res.json({
    name: 'Trading-IA API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/health',
    endpoints: {
      health: 'GET /api/health',
      pairs: 'GET /api/pairs',
      candles: 'GET /api/candles?pair=EURUSD&timeframe=H1',
      signals: 'GET /api/signals',
      trades: 'GET /api/trades',
    },
  });
});

// ===========================================
// GESTION DES ERREURS
// ===========================================

// 404
app.use(notFoundHandler);

// Erreurs globales
app.use(errorHandler);

// ===========================================
// DÉMARRAGE DU SERVEUR
// ===========================================

async function startServer(): Promise<void> {
  try {
    // Vérifier la connexion à la base de données
    console.log('🔌 Connecting to database...');
    const dbConnected = await checkDatabaseConnection();

    if (!dbConnected) {
      console.error('❌ Failed to connect to database');
      console.error('   Please check your DATABASE_URL in .env');
      process.exit(1);
    }

    console.log('✅ Database connected');

    // Démarrer le serveur
    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║           🚀 Trading-IA Backend Started               ║
╠═══════════════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(40)}║
║  Port:        ${config.port.toString().padEnd(40)}║
║  API URL:     http://localhost:${config.port}/api${' '.repeat(20)}║
║  Health:      http://localhost:${config.port}/api/health${' '.repeat(13)}║
╚═══════════════════════════════════════════════════════╝
      `);

      if (config.isDev) {
        console.log('📝 Available endpoints:');
        console.log('   GET  /api/health          - Health check');
        console.log('   GET  /api/pairs           - List forex pairs');
        console.log('   GET  /api/candles         - Get OHLCV data');
        console.log('   GET  /api/signals         - Get trading signals');
        console.log('   POST /api/signals         - Create signal (requires API key)');
        console.log('   GET  /api/trades          - Get trades');
        console.log('   POST /api/trades          - Create trade (requires API key)');
        console.log('   PATCH /api/trades/:id/close - Close trade (requires API key)');
        console.log('');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    await disconnectDatabase();
    console.log('✅ Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Démarrer
startServer();
