/**
 * API Routes
 * Configuration de toutes les routes de l'API
 */

import { Router } from 'express';

// Controllers
import * as healthController from '../controllers/health.controller';
import * as pairsController from '../controllers/pairs.controller';
import * as candlesController from '../controllers/candles.controller';
import * as signalsController from '../controllers/signals.controller';
import * as tradesController from '../controllers/trades.controller';

// Middlewares
import { requireApiKey } from '../middlewares/auth';
import { validateBody, validateQuery } from '../middlewares/validate';

// Validation schemas
import {
  GetCandlesQuerySchema,
  GetSignalsQuerySchema,
  CreateSignalBodySchema,
  CreateTradeBodySchema,
  CloseTradeBodySchema,
  BatchCandlesBodySchema,
} from '../types';

const router = Router();

// ===========================================
// HEALTH
// ===========================================
router.get('/health', healthController.getHealth);

// ===========================================
// PAIRS
// ===========================================
/**
 * GET /pairs
 * Retourne toutes les paires Forex actives
 * Query: ?activeOnly=true|false
 */
router.get('/pairs', pairsController.getPairs);

/**
 * GET /pairs/:symbol
 * Retourne une paire par son symbole
 */
router.get('/pairs/:symbol', pairsController.getPairBySymbol);

// ===========================================
// CANDLES
// ===========================================
/**
 * GET /candles
 * Retourne les bougies OHLCV
 * Query: ?pair=EURUSD&timeframe=H1&limit=100
 */
router.get(
  '/candles',
  validateQuery(GetCandlesQuerySchema),
  candlesController.getCandles
);

/**
 * GET /candles/latest
 * Retourne la dernière bougie
 * Query: ?pair=EURUSD&timeframe=H1
 */
router.get('/candles/latest', candlesController.getLatestCandle);

/**
 * GET /candles/stats
 * Retourne les statistiques des bougies stockées
 */
router.get('/candles/stats', candlesController.getCandlesStats);

/**
 * POST /candles/batch
 * Insère des bougies en batch (N8N)
 * Requiert API key
 */
router.post(
  '/candles/batch',
  requireApiKey,
  validateBody(BatchCandlesBodySchema),
  candlesController.insertCandlesBatch
);

/**
 * DELETE /candles/cleanup
 * Supprime les anciennes bougies
 * Requiert API key
 */
router.delete('/candles/cleanup', requireApiKey, candlesController.cleanupCandles);

// ===========================================
// SIGNALS
// ===========================================
/**
 * GET /signals
 * Retourne les signaux de trading
 * Query: ?pair=EURUSD&timeframe=H1&direction=BUY&activeOnly=true&limit=20
 */
router.get(
  '/signals',
  validateQuery(GetSignalsQuerySchema),
  signalsController.getSignals
);

/**
 * GET /signals/stats
 * Retourne les statistiques des signaux
 */
router.get('/signals/stats', signalsController.getSignalsStats);

/**
 * GET /signals/:id
 * Retourne un signal par son ID
 */
router.get('/signals/:id', signalsController.getSignalById);

/**
 * POST /signals
 * Crée un nouveau signal (N8N/ML)
 * Requiert API key
 *
 * Body exemple:
 * {
 *   "pair": "EURUSD",
 *   "timeframe": "H1",
 *   "direction": "BUY",
 *   "confidence": 0.85,
 *   "entryPrice": 1.0850,
 *   "takeProfit": 1.0900,
 *   "stopLoss": 1.0820,
 *   "reasonSummary": "RSI oversold + MACD bullish crossover",
 *   "source": "ML",
 *   "modelVersion": "1.0.0"
 * }
 */
router.post(
  '/signals',
  requireApiKey,
  validateBody(CreateSignalBodySchema),
  signalsController.createSignal
);

/**
 * PATCH /signals/:id/deactivate
 * Désactive un signal
 * Requiert API key
 */
router.patch('/signals/:id/deactivate', requireApiKey, signalsController.deactivateSignal);

/**
 * POST /signals/expire
 * Expire les anciens signaux
 * Requiert API key
 */
router.post('/signals/expire', requireApiKey, signalsController.expireSignals);

// ===========================================
// TRADES
// ===========================================
/**
 * GET /trades
 * Retourne tous les trades
 * Query: ?pair=EURUSD&status=OPEN&limit=50
 */
router.get('/trades', tradesController.getTrades);

/**
 * GET /trades/open
 * Retourne les trades ouverts
 */
router.get('/trades/open', tradesController.getOpenTrades);

/**
 * GET /trades/stats
 * Retourne les statistiques des trades
 */
router.get('/trades/stats', tradesController.getTradesStats);

/**
 * GET /trades/:id
 * Retourne un trade par son ID
 */
router.get('/trades/:id', tradesController.getTradeById);

/**
 * POST /trades
 * Crée un nouveau trade
 * Requiert API key
 *
 * Body exemple:
 * {
 *   "pair": "EURUSD",
 *   "direction": "LONG",
 *   "entryPrice": 1.0850,
 *   "takeProfit": 1.0900,
 *   "stopLoss": 1.0820,
 *   "positionSize": 0.1,
 *   "signalId": "signal_id_optionnel"
 * }
 */
router.post(
  '/trades',
  requireApiKey,
  validateBody(CreateTradeBodySchema),
  tradesController.createTrade
);

/**
 * PATCH /trades/:id/close
 * Ferme un trade
 * Requiert API key
 *
 * Body exemple:
 * {
 *   "exitPrice": 1.0875,
 *   "closeReason": "TP"
 * }
 */
router.patch(
  '/trades/:id/close',
  requireApiKey,
  validateBody(CloseTradeBodySchema),
  tradesController.closeTrade
);

/**
 * DELETE /trades/:id
 * Annule un trade
 * Requiert API key
 */
router.delete('/trades/:id', requireApiKey, tradesController.cancelTrade);

export default router;
