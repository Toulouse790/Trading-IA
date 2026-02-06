/**
 * Service d'analyse IA pour le trading Forex EUR/USD
 * Utilise Google Gemini pour générer des signaux et analyses
 */

import { GoogleGenAI } from '@google/genai';
import {
  Candle,
  TechnicalIndicators,
  TradingSignal,
  AIAnalysis,
  SignalType,
  SignalStrength,
  TimeFrame,
  TrendDirection,
  MarketData,
} from '../types';

// ============================================
// CONFIGURATION GEMINI
// ============================================

const getApiKey = (): string => {
  if (typeof window !== 'undefined' && (window as any).aistudio?.apiKey) {
    return (window as any).aistudio.apiKey;
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

let genAI: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAI) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('Clé API Gemini non configurée');
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

// ============================================
// ANALYSE IA DU MARCHÉ
// ============================================

export async function analyzeMarket(
  candles: Candle[],
  indicators: TechnicalIndicators,
  marketData: MarketData,
  timeframe: TimeFrame
): Promise<AIAnalysis> {
  const ai = getGenAI();

  const prompt = buildAnalysisPrompt(candles, indicators, marketData, timeframe);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const text = response.text || '';
    return parseAIAnalysis(text, indicators);
  } catch (error) {
    console.error('Erreur analyse IA:', error);
    return generateFallbackAnalysis(indicators, marketData);
  }
}

function buildAnalysisPrompt(
  candles: Candle[],
  indicators: TechnicalIndicators,
  marketData: MarketData,
  timeframe: TimeFrame
): string {
  const recentCandles = candles.slice(-20);
  const candlesSummary = recentCandles.map(c =>
    `${c.date.toISOString().split('T')[0]}: O=${c.open.toFixed(5)} H=${c.high.toFixed(5)} L=${c.low.toFixed(5)} C=${c.close.toFixed(5)}`
  ).join('\n');

  return `Tu es un analyste forex expert spécialisé sur EUR/USD. Analyse les données suivantes et fournis une analyse complète en JSON.

## Données de marché EUR/USD
- Prix actuel: ${marketData.currentPrice.toFixed(5)}
- Bid: ${marketData.bid.toFixed(5)} / Ask: ${marketData.ask.toFixed(5)}
- Variation 24h: ${marketData.changePercent24h.toFixed(2)}%
- Plus haut 24h: ${marketData.high24h.toFixed(5)}
- Plus bas 24h: ${marketData.low24h.toFixed(5)}

## Timeframe: ${timeframe}

## Indicateurs techniques
- RSI(14): ${indicators.rsi.value} (${indicators.rsi.overbought ? 'SURACHETÉ' : indicators.rsi.oversold ? 'SURVENDU' : 'NEUTRE'})
- MACD: ${indicators.macd.macd} | Signal: ${indicators.macd.signal} | Histogramme: ${indicators.macd.histogram} (Crossover: ${indicators.macd.crossover})
- Bollinger Bands: Upper=${indicators.bollingerBands.upper.toFixed(5)} Middle=${indicators.bollingerBands.middle.toFixed(5)} Lower=${indicators.bollingerBands.lower.toFixed(5)} (%B: ${indicators.bollingerBands.percentB})
- SMA: 20=${indicators.movingAverages.sma20.toFixed(5)} 50=${indicators.movingAverages.sma50.toFixed(5)} 200=${indicators.movingAverages.sma200.toFixed(5)}
- Stochastic: K=${indicators.stochastic.k} D=${indicators.stochastic.d}
- ATR: ${indicators.atr.value} pips (Volatilité: ${indicators.atr.volatility})
- Pivot Points: P=${indicators.pivotPoints.pivot.toFixed(5)} R1=${indicators.pivotPoints.r1.toFixed(5)} S1=${indicators.pivotPoints.s1.toFixed(5)}
- Fibonacci: 38.2%=${indicators.fibonacci.level382.toFixed(5)} 50%=${indicators.fibonacci.level500.toFixed(5)} 61.8%=${indicators.fibonacci.level618.toFixed(5)}

## 20 dernières bougies
${candlesSummary}

## Instructions
Réponds UNIQUEMENT avec un JSON valide (sans markdown) au format suivant:
{
  "summary": "Résumé de l'analyse en 2-3 phrases",
  "trend": "bullish" | "bearish" | "sideways",
  "sentiment": "bullish" | "bearish" | "neutral",
  "support_levels": [niveau1, niveau2, niveau3],
  "resistance_levels": [niveau1, niveau2, niveau3],
  "recommendation": "buy" | "sell" | "hold",
  "confidence": 0-100,
  "reasoning": ["raison1", "raison2", "raison3"],
  "risks": ["risque1", "risque2"],
  "opportunities": ["opportunité1", "opportunité2"],
  "short_term_outlook": "Perspective court terme",
  "long_term_outlook": "Perspective long terme"
}`;
}

function parseAIAnalysis(text: string, indicators: TechnicalIndicators): AIAnalysis {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON non trouvé');

    const data = JSON.parse(jsonMatch[0]);

    return {
      summary: data.summary || 'Analyse non disponible',
      trend: data.trend as TrendDirection || TrendDirection.SIDEWAYS,
      sentiment: data.sentiment || 'neutral',
      keyLevels: {
        support: data.support_levels || [indicators.pivotPoints.s1, indicators.pivotPoints.s2],
        resistance: data.resistance_levels || [indicators.pivotPoints.r1, indicators.pivotPoints.r2],
      },
      recommendation: data.recommendation === 'buy' ? SignalType.BUY :
                      data.recommendation === 'sell' ? SignalType.SELL : SignalType.HOLD,
      confidence: Math.min(100, Math.max(0, data.confidence || 50)),
      reasoning: data.reasoning || [],
      risks: data.risks || [],
      opportunities: data.opportunities || [],
      shortTermOutlook: data.short_term_outlook || '',
      longTermOutlook: data.long_term_outlook || '',
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Erreur parsing analyse:', error);
    return generateFallbackAnalysis(indicators, null as any);
  }
}

function generateFallbackAnalysis(
  indicators: TechnicalIndicators,
  marketData: MarketData | null
): AIAnalysis {
  const { rsi, macd, movingAverages } = indicators;

  let trend: TrendDirection;
  let recommendation: SignalType;
  let confidence = 50;
  const reasoning: string[] = [];

  if (rsi.value > 70 && macd.histogram < 0) {
    trend = TrendDirection.BEARISH;
    recommendation = SignalType.SELL;
    confidence = 65;
    reasoning.push('RSI en zone de surachat');
    reasoning.push('Histogramme MACD négatif');
  } else if (rsi.value < 30 && macd.histogram > 0) {
    trend = TrendDirection.BULLISH;
    recommendation = SignalType.BUY;
    confidence = 65;
    reasoning.push('RSI en zone de survente');
    reasoning.push('Histogramme MACD positif');
  } else if (movingAverages.trend === TrendDirection.BULLISH) {
    trend = TrendDirection.BULLISH;
    recommendation = SignalType.BUY;
    confidence = 55;
    reasoning.push('Moyennes mobiles alignées à la hausse');
  } else if (movingAverages.trend === TrendDirection.BEARISH) {
    trend = TrendDirection.BEARISH;
    recommendation = SignalType.SELL;
    confidence = 55;
    reasoning.push('Moyennes mobiles alignées à la baisse');
  } else {
    trend = TrendDirection.SIDEWAYS;
    recommendation = SignalType.HOLD;
    reasoning.push('Marché sans direction claire');
  }

  return {
    summary: `Analyse basée sur les indicateurs techniques. Tendance ${trend}. ${reasoning[0] || ''}`,
    trend,
    sentiment: trend === TrendDirection.BULLISH ? 'bullish' :
               trend === TrendDirection.BEARISH ? 'bearish' : 'neutral',
    keyLevels: {
      support: [indicators.pivotPoints.s1, indicators.pivotPoints.s2, indicators.fibonacci.level382],
      resistance: [indicators.pivotPoints.r1, indicators.pivotPoints.r2, indicators.fibonacci.level618],
    },
    recommendation,
    confidence,
    reasoning,
    risks: ['Volatilité du marché', 'Annonces économiques'],
    opportunities: [],
    shortTermOutlook: `Tendance ${trend} sur le court terme`,
    longTermOutlook: 'Surveiller les niveaux clés',
    timestamp: new Date(),
  };
}

// ============================================
// GÉNÉRATION DE SIGNAUX DE TRADING
// ============================================

export async function generateTradingSignal(
  candles: Candle[],
  indicators: TechnicalIndicators,
  marketData: MarketData,
  timeframe: TimeFrame
): Promise<TradingSignal | null> {
  const ai = getGenAI();

  const prompt = buildSignalPrompt(candles, indicators, marketData, timeframe);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    });

    const text = response.text || '';
    return parseSignalResponse(text, marketData, timeframe);
  } catch (error) {
    console.error('Erreur génération signal:', error);
    return generateTechnicalSignal(indicators, marketData, timeframe);
  }
}

function buildSignalPrompt(
  candles: Candle[],
  indicators: TechnicalIndicators,
  marketData: MarketData,
  timeframe: TimeFrame
): string {
  return `Tu es un système de trading automatisé EUR/USD. Génère un signal de trading basé sur les données suivantes.

## Prix EUR/USD
- Actuel: ${marketData.currentPrice.toFixed(5)}
- Spread: ${(marketData.spread * 10000).toFixed(1)} pips

## Indicateurs
- RSI: ${indicators.rsi.value}
- MACD: ${indicators.macd.macd} (Signal: ${indicators.macd.signal}, Crossover: ${indicators.macd.crossover})
- Bollinger %B: ${indicators.bollingerBands.percentB}
- Stochastic K/D: ${indicators.stochastic.k}/${indicators.stochastic.d}
- ATR: ${indicators.atr.value} pips
- Trend MA: ${indicators.movingAverages.trend}
- Support: ${indicators.pivotPoints.s1.toFixed(5)}
- Resistance: ${indicators.pivotPoints.r1.toFixed(5)}

## Timeframe: ${timeframe}

Réponds UNIQUEMENT avec un JSON valide:
{
  "type": "buy" | "sell" | "hold",
  "strength": "weak" | "moderate" | "strong" | "very_strong",
  "entry_price": number,
  "stop_loss": number,
  "take_profit_1": number,
  "take_profit_2": number,
  "take_profit_3": number,
  "confidence": 0-100,
  "reasoning": "Explication courte du signal",
  "indicators_used": ["indicateur1", "indicateur2"]
}

Si aucun signal clair, utilise "type": "hold".`;
}

function parseSignalResponse(
  text: string,
  marketData: MarketData,
  timeframe: TimeFrame
): TradingSignal | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const data = JSON.parse(jsonMatch[0]);

    if (data.type === 'hold') return null;

    const signalType = data.type === 'buy' ? SignalType.BUY : SignalType.SELL;
    const entryPrice = data.entry_price || marketData.currentPrice;
    const stopLoss = data.stop_loss || (signalType === SignalType.BUY
      ? entryPrice - 0.0030
      : entryPrice + 0.0030);

    const takeProfits = [
      data.take_profit_1,
      data.take_profit_2,
      data.take_profit_3,
    ].filter(tp => tp && tp > 0);

    if (takeProfits.length === 0) {
      takeProfits.push(signalType === SignalType.BUY
        ? entryPrice + 0.0050
        : entryPrice - 0.0050);
    }

    const riskPips = Math.abs(entryPrice - stopLoss) / 0.0001;
    const rewardPips = Math.abs(takeProfits[0] - entryPrice) / 0.0001;
    const riskReward = rewardPips / riskPips;

    return {
      id: `sig_${Date.now()}`,
      timestamp: new Date(),
      pair: 'EUR/USD',
      type: signalType,
      strength: data.strength as SignalStrength || SignalStrength.MODERATE,
      entryPrice,
      stopLoss,
      takeProfit: takeProfits,
      riskRewardRatio: Number(riskReward.toFixed(2)),
      confidence: Math.min(100, Math.max(0, data.confidence || 60)),
      timeframe,
      reasoning: data.reasoning || 'Signal généré par analyse IA',
      indicators: data.indicators_used || [],
      aiAnalysis: data.reasoning,
      status: 'active',
    };
  } catch (error) {
    console.error('Erreur parsing signal:', error);
    return null;
  }
}

function generateTechnicalSignal(
  indicators: TechnicalIndicators,
  marketData: MarketData,
  timeframe: TimeFrame
): TradingSignal | null {
  const { rsi, macd, stochastic, bollingerBands, atr } = indicators;

  let signalType: SignalType | null = null;
  let strength: SignalStrength = SignalStrength.WEAK;
  let confidence = 50;
  const usedIndicators: string[] = [];
  const reasons: string[] = [];

  // Conditions d'achat
  let buyScore = 0;
  if (rsi.value < 35) { buyScore += 2; usedIndicators.push('RSI'); reasons.push('RSI survendu'); }
  if (macd.crossover === 'bullish') { buyScore += 3; usedIndicators.push('MACD'); reasons.push('Crossover MACD haussier'); }
  if (stochastic.oversold) { buyScore += 2; usedIndicators.push('Stochastic'); reasons.push('Stochastic survendu'); }
  if (bollingerBands.percentB < 0.1) { buyScore += 2; usedIndicators.push('Bollinger'); reasons.push('Prix près de la bande inférieure'); }

  // Conditions de vente
  let sellScore = 0;
  if (rsi.value > 65) { sellScore += 2; usedIndicators.push('RSI'); reasons.push('RSI suracheté'); }
  if (macd.crossover === 'bearish') { sellScore += 3; usedIndicators.push('MACD'); reasons.push('Crossover MACD baissier'); }
  if (stochastic.overbought) { sellScore += 2; usedIndicators.push('Stochastic'); reasons.push('Stochastic suracheté'); }
  if (bollingerBands.percentB > 0.9) { sellScore += 2; usedIndicators.push('Bollinger'); reasons.push('Prix près de la bande supérieure'); }

  if (buyScore >= 4 && buyScore > sellScore) {
    signalType = SignalType.BUY;
    if (buyScore >= 7) { strength = SignalStrength.VERY_STRONG; confidence = 80; }
    else if (buyScore >= 5) { strength = SignalStrength.STRONG; confidence = 70; }
    else { strength = SignalStrength.MODERATE; confidence = 60; }
  } else if (sellScore >= 4 && sellScore > buyScore) {
    signalType = SignalType.SELL;
    if (sellScore >= 7) { strength = SignalStrength.VERY_STRONG; confidence = 80; }
    else if (sellScore >= 5) { strength = SignalStrength.STRONG; confidence = 70; }
    else { strength = SignalStrength.MODERATE; confidence = 60; }
  }

  if (!signalType) return null;

  const entryPrice = marketData.currentPrice;
  const atrValue = atr.value * 0.0001;
  const stopDistance = atrValue * 1.5;
  const tpDistance = atrValue * 2;

  const stopLoss = signalType === SignalType.BUY
    ? entryPrice - stopDistance
    : entryPrice + stopDistance;

  const tp1 = signalType === SignalType.BUY
    ? entryPrice + tpDistance
    : entryPrice - tpDistance;
  const tp2 = signalType === SignalType.BUY
    ? entryPrice + tpDistance * 1.5
    : entryPrice - tpDistance * 1.5;
  const tp3 = signalType === SignalType.BUY
    ? entryPrice + tpDistance * 2
    : entryPrice - tpDistance * 2;

  const riskPips = Math.abs(entryPrice - stopLoss) / 0.0001;
  const rewardPips = Math.abs(tp1 - entryPrice) / 0.0001;

  return {
    id: `sig_${Date.now()}`,
    timestamp: new Date(),
    pair: 'EUR/USD',
    type: signalType,
    strength,
    entryPrice: Number(entryPrice.toFixed(5)),
    stopLoss: Number(stopLoss.toFixed(5)),
    takeProfit: [
      Number(tp1.toFixed(5)),
      Number(tp2.toFixed(5)),
      Number(tp3.toFixed(5)),
    ],
    riskRewardRatio: Number((rewardPips / riskPips).toFixed(2)),
    confidence,
    timeframe,
    reasoning: reasons.join('. '),
    indicators: [...new Set(usedIndicators)],
    status: 'active',
  };
}

// ============================================
// ANALYSE DE SENTIMENT
// ============================================

export async function analyzeSentiment(): Promise<{
  overall: 'bullish' | 'bearish' | 'neutral';
  score: number;
  factors: string[];
}> {
  const ai = getGenAI();

  const prompt = `Analyse le sentiment actuel du marché EUR/USD basé sur les facteurs macroéconomiques courants.
Considère: politique monétaire BCE/Fed, inflation, emploi, géopolitique.

Réponds en JSON:
{
  "overall": "bullish" | "bearish" | "neutral",
  "score": -100 à 100,
  "factors": ["facteur1", "facteur2", "facteur3"]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.4, maxOutputTokens: 512 },
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Erreur sentiment:', error);
  }

  return {
    overall: 'neutral',
    score: 0,
    factors: ['Données non disponibles'],
  };
}

// ============================================
// CONSEIL DE TRADING
// ============================================

export async function getTradingAdvice(
  analysis: AIAnalysis,
  portfolio: { balance: number; openPositions: number }
): Promise<string> {
  const ai = getGenAI();

  const prompt = `En tant que conseiller trading, donne un conseil personnalisé.

Analyse actuelle:
- Tendance: ${analysis.trend}
- Recommandation: ${analysis.recommendation}
- Confiance: ${analysis.confidence}%
- Risques: ${analysis.risks.join(', ')}

Portefeuille:
- Solde: $${portfolio.balance}
- Positions ouvertes: ${portfolio.openPositions}

Donne un conseil concis (2-3 phrases) sur l'action à prendre maintenant.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.5, maxOutputTokens: 256 },
    });

    return response.text || 'Continuez à surveiller le marché.';
  } catch (error) {
    return 'Respectez votre plan de trading et gérez votre risque.';
  }
}
