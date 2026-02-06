/**
 * Prisma Seed Script
 * Initialise la base de données avec les données de base
 *
 * Usage: npx prisma db seed
 * ou: npm run db:seed
 */

import { PrismaClient, SignalDirection, SignalSource, ModelType } from '@prisma/client';

const prisma = new PrismaClient();

// ===========================================
// FOREX PAIRS DATA
// ===========================================
const forexPairs = [
  {
    symbol: 'EURUSD',
    displayName: 'EUR/USD',
    description: 'Euro vs US Dollar - La paire la plus tradée au monde',
    baseCurrency: 'EUR',
    quoteCurrency: 'USD',
    pipValue: 0.0001,
    spreadPips: 1.0,
    isActive: true,
    isMajor: true,
  },
  {
    symbol: 'GBPUSD',
    displayName: 'GBP/USD',
    description: 'British Pound vs US Dollar',
    baseCurrency: 'GBP',
    quoteCurrency: 'USD',
    pipValue: 0.0001,
    spreadPips: 1.5,
    isActive: true,
    isMajor: true,
  },
  {
    symbol: 'USDJPY',
    displayName: 'USD/JPY',
    description: 'US Dollar vs Japanese Yen',
    baseCurrency: 'USD',
    quoteCurrency: 'JPY',
    pipValue: 0.01,
    spreadPips: 1.2,
    isActive: true,
    isMajor: true,
  },
  {
    symbol: 'USDCHF',
    displayName: 'USD/CHF',
    description: 'US Dollar vs Swiss Franc',
    baseCurrency: 'USD',
    quoteCurrency: 'CHF',
    pipValue: 0.0001,
    spreadPips: 1.5,
    isActive: true,
    isMajor: true,
  },
  {
    symbol: 'AUDUSD',
    displayName: 'AUD/USD',
    description: 'Australian Dollar vs US Dollar',
    baseCurrency: 'AUD',
    quoteCurrency: 'USD',
    pipValue: 0.0001,
    spreadPips: 1.4,
    isActive: true,
    isMajor: true,
  },
  {
    symbol: 'USDCAD',
    displayName: 'USD/CAD',
    description: 'US Dollar vs Canadian Dollar',
    baseCurrency: 'USD',
    quoteCurrency: 'CAD',
    pipValue: 0.0001,
    spreadPips: 1.6,
    isActive: true,
    isMajor: true,
  },
  {
    symbol: 'NZDUSD',
    displayName: 'NZD/USD',
    description: 'New Zealand Dollar vs US Dollar',
    baseCurrency: 'NZD',
    quoteCurrency: 'USD',
    pipValue: 0.0001,
    spreadPips: 1.8,
    isActive: true,
    isMajor: true,
  },
  // Cross pairs (optionnelles, désactivées par défaut)
  {
    symbol: 'EURGBP',
    displayName: 'EUR/GBP',
    description: 'Euro vs British Pound',
    baseCurrency: 'EUR',
    quoteCurrency: 'GBP',
    pipValue: 0.0001,
    spreadPips: 2.0,
    isActive: false,
    isMajor: false,
  },
  {
    symbol: 'EURJPY',
    displayName: 'EUR/JPY',
    description: 'Euro vs Japanese Yen',
    baseCurrency: 'EUR',
    quoteCurrency: 'JPY',
    pipValue: 0.01,
    spreadPips: 2.2,
    isActive: false,
    isMajor: false,
  },
  {
    symbol: 'GBPJPY',
    displayName: 'GBP/JPY',
    description: 'British Pound vs Japanese Yen',
    baseCurrency: 'GBP',
    quoteCurrency: 'JPY',
    pipValue: 0.01,
    spreadPips: 2.5,
    isActive: false,
    isMajor: false,
  },
];

// ===========================================
// GENERATE SAMPLE CANDLES
// ===========================================
function generateSampleCandles(pairId: string, symbol: string, count: number = 100) {
  const candles = [];
  const now = new Date();
  const basePrice = symbol.includes('JPY') ? 150.0 : 1.0850;
  const volatility = symbol.includes('JPY') ? 0.5 : 0.0010;

  let currentPrice = basePrice;

  for (let i = count; i > 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // Bougies H1

    // Simuler un mouvement de prix réaliste
    const change = (Math.random() - 0.5) * 2 * volatility;
    const open = currentPrice;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;

    currentPrice = close;

    candles.push({
      pairId,
      timeframe: 'H1',
      timestamp,
      open: Number(open.toFixed(symbol.includes('JPY') ? 3 : 5)),
      high: Number(high.toFixed(symbol.includes('JPY') ? 3 : 5)),
      low: Number(low.toFixed(symbol.includes('JPY') ? 3 : 5)),
      close: Number(close.toFixed(symbol.includes('JPY') ? 3 : 5)),
      volume: Math.floor(Math.random() * 10000) + 1000,
    });
  }

  return candles;
}

// ===========================================
// SAMPLE SIGNALS
// ===========================================
function generateSampleSignals(pairId: string, count: number = 10) {
  const signals = [];
  const now = new Date();

  const directions: SignalDirection[] = ['BUY', 'SELL', 'NO_TRADE'];
  const sources: SignalSource[] = ['ML', 'LLM', 'HYBRID', 'RULES'];

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - i * 4 * 60 * 60 * 1000); // Toutes les 4h
    const direction = directions[Math.floor(Math.random() * directions.length)] as SignalDirection;
    const confidence = 0.5 + Math.random() * 0.45; // 0.5 à 0.95

    signals.push({
      pairId,
      timeframe: 'H1',
      timestamp,
      direction,
      confidence: Number(confidence.toFixed(2)),
      entryPrice: 1.0850 + (Math.random() - 0.5) * 0.01,
      takeProfit: direction === 'BUY' ? 1.0900 : 1.0800,
      stopLoss: direction === 'BUY' ? 1.0820 : 1.0880,
      riskReward: 2.0,
      reasonSummary: direction === 'BUY'
        ? 'RSI oversold + MACD bullish crossover'
        : direction === 'SELL'
        ? 'RSI overbought + Price at resistance'
        : 'Market indecision - no clear setup',
      source: sources[Math.floor(Math.random() * sources.length)] as SignalSource,
      modelVersion: '1.0.0',
      modelName: 'TradingIA-Ensemble',
      indicators: {
        rsi: Math.floor(Math.random() * 100),
        macd: { value: (Math.random() - 0.5) * 0.001, signal: (Math.random() - 0.5) * 0.001 },
        trend: direction === 'BUY' ? 'bullish' : direction === 'SELL' ? 'bearish' : 'sideways',
      },
      isActive: i < 3, // Seulement les 3 derniers actifs
    });
  }

  return signals;
}

// ===========================================
// SAMPLE ML MODELS
// ===========================================
const mlModels = [
  {
    name: 'TradingIA-LinearRegression',
    version: '1.0.0',
    type: ModelType.LINEAR,
    description: 'Modèle de régression linéaire pour prédiction de prix',
    config: {
      features: ['rsi', 'macd', 'bollinger', 'sma_20', 'sma_50'],
      lookback: 20,
      horizon: 4,
    },
    metrics: {
      sharpe: 1.2,
      winRate: 0.58,
      maxDrawdown: 0.15,
      profitFactor: 1.4,
      totalTrades: 150,
    },
    isActive: true,
    isDefault: false,
  },
  {
    name: 'TradingIA-KNN',
    version: '1.0.0',
    type: ModelType.KNN,
    description: 'K-Nearest Neighbors pour classification de direction',
    config: {
      k: 5,
      features: ['rsi', 'macd_histogram', 'price_change', 'volatility'],
      normalize: true,
    },
    metrics: {
      accuracy: 0.62,
      precision: 0.60,
      recall: 0.65,
      f1Score: 0.62,
    },
    isActive: true,
    isDefault: false,
  },
  {
    name: 'TradingIA-Ensemble',
    version: '1.0.0',
    type: ModelType.ENSEMBLE,
    description: 'Ensemble combinant LR + KNN + règles techniques',
    config: {
      models: ['TradingIA-LinearRegression', 'TradingIA-KNN'],
      weights: [0.4, 0.3, 0.3],
      votingStrategy: 'weighted',
    },
    metrics: {
      sharpe: 1.5,
      winRate: 0.64,
      maxDrawdown: 0.12,
      profitFactor: 1.7,
      totalTrades: 120,
    },
    isActive: true,
    isDefault: true,
  },
];

// ===========================================
// MAIN SEED FUNCTION
// ===========================================
async function main() {
  console.log('🌱 Starting database seed...\n');

  // 1. Créer les paires Forex
  console.log('📊 Creating forex pairs...');
  for (const pair of forexPairs) {
    await prisma.forexPair.upsert({
      where: { symbol: pair.symbol },
      update: pair,
      create: pair,
    });
    console.log(`  ✓ ${pair.displayName}`);
  }

  // 2. Récupérer les paires créées
  const pairs = await prisma.forexPair.findMany({
    where: { isActive: true },
  });

  // 3. Créer des bougies pour EURUSD uniquement (pour limiter les données)
  console.log('\n📈 Creating sample candles for EURUSD...');
  const eurusd = pairs.find(p => p.symbol === 'EURUSD');
  if (eurusd) {
    const candles = generateSampleCandles(eurusd.id, eurusd.symbol, 200);

    // Supprimer les anciennes bougies de test
    await prisma.forexCandle.deleteMany({
      where: { pairId: eurusd.id },
    });

    // Insérer les nouvelles
    await prisma.forexCandle.createMany({
      data: candles,
      skipDuplicates: true,
    });
    console.log(`  ✓ ${candles.length} candles created`);
  }

  // 4. Créer des signaux de test
  console.log('\n🎯 Creating sample signals...');
  if (eurusd) {
    const signals = generateSampleSignals(eurusd.id, 15);

    await prisma.signal.deleteMany({
      where: { pairId: eurusd.id },
    });

    for (const signal of signals) {
      await prisma.signal.create({
        data: signal,
      });
    }
    console.log(`  ✓ ${signals.length} signals created`);
  }

  // 5. Créer les modèles ML
  console.log('\n🤖 Creating ML models...');
  for (const model of mlModels) {
    await prisma.mLModel.upsert({
      where: {
        name_version: {
          name: model.name,
          version: model.version,
        },
      },
      update: model,
      create: {
        ...model,
        trainedAt: new Date(),
        trainedOn: 'EURUSD H1 data - 2023-2024',
      },
    });
    console.log(`  ✓ ${model.name} v${model.version}`);
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\nSummary:');
  console.log(`  - ${forexPairs.length} forex pairs`);
  console.log(`  - 200 sample candles (EURUSD H1)`);
  console.log(`  - 15 sample signals`);
  console.log(`  - ${mlModels.length} ML models`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
