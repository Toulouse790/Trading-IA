/**
 * Service News et Analyse de Sentiment
 * Récupère les actualités financières et analyse le sentiment avec Gemini
 */

import { GoogleGenAI } from '@google/genai';
import { getAPIConfig } from '../../config/apiConfig';

export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: Date;
  category: 'forex' | 'economy' | 'central_bank' | 'general';
  related: string[];
  sentiment?: {
    score: number; // -1 à 1
    label: 'bearish' | 'neutral' | 'bullish';
    confidence: number;
  };
  impact?: 'low' | 'medium' | 'high';
}

export interface MarketSentiment {
  overall: 'bearish' | 'neutral' | 'bullish';
  score: number; // -100 à 100
  eurSentiment: number;
  usdSentiment: number;
  newsCount: number;
  lastUpdate: Date;
  topBullishFactors: string[];
  topBearishFactors: string[];
}

// Cache pour les news
let newsCache: NewsArticle[] = [];
let newsCacheTimestamp = 0;
const NEWS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère les actualités financières depuis Finnhub
 */
export async function fetchForexNews(): Promise<NewsArticle[]> {
  // Vérifier le cache
  if (newsCache.length > 0 && Date.now() - newsCacheTimestamp < NEWS_CACHE_DURATION) {
    return newsCache;
  }

  const config = getAPIConfig();

  if (!config.finnhub.apiKey) {
    console.log('[News] Pas de clé Finnhub, utilisation des news de fallback');
    return getFallbackNews();
  }

  try {
    const response = await fetch(
      `${config.finnhub.baseUrl}/news?category=forex&token=${config.finnhub.apiKey}`
    );

    if (!response.ok) {
      throw new Error('Erreur API Finnhub');
    }

    const data = await response.json();

    const articles: NewsArticle[] = data.slice(0, 20).map((item: any) => ({
      id: String(item.id),
      headline: item.headline,
      summary: item.summary || item.headline,
      source: item.source,
      url: item.url,
      datetime: new Date(item.datetime * 1000),
      category: categorizeNews(item.headline, item.summary),
      related: item.related ? item.related.split(',') : ['EUR/USD'],
    }));

    // Analyser le sentiment de chaque article
    const analyzedArticles = await analyzeNewsSentiment(articles);

    newsCache = analyzedArticles;
    newsCacheTimestamp = Date.now();

    console.log(`[News] ${analyzedArticles.length} articles récupérés`);
    return analyzedArticles;
  } catch (error) {
    console.error('[News] Erreur:', error);
    return getFallbackNews();
  }
}

/**
 * Catégorise une news
 */
function categorizeNews(headline: string, summary: string): 'forex' | 'economy' | 'central_bank' | 'general' {
  const text = `${headline} ${summary}`.toLowerCase();

  if (text.includes('fed') || text.includes('ecb') || text.includes('central bank') ||
      text.includes('rate decision') || text.includes('bce') || text.includes('fomc')) {
    return 'central_bank';
  }

  if (text.includes('gdp') || text.includes('inflation') || text.includes('cpi') ||
      text.includes('employment') || text.includes('jobs') || text.includes('pmi')) {
    return 'economy';
  }

  if (text.includes('eur/usd') || text.includes('euro') || text.includes('dollar') ||
      text.includes('forex') || text.includes('currency')) {
    return 'forex';
  }

  return 'general';
}

/**
 * Analyse le sentiment des news avec Gemini
 */
async function analyzeNewsSentiment(articles: NewsArticle[]): Promise<NewsArticle[]> {
  const config = getAPIConfig();

  if (!config.gemini.apiKey || articles.length === 0) {
    return articles;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

    // Analyser par batch pour économiser les appels API
    const headlines = articles.map((a) => a.headline).join('\n');

    const prompt = `Analyse le sentiment de ces titres d'actualités financières pour EUR/USD.
Pour chaque titre, indique si c'est bullish (positif pour EUR), bearish (négatif pour EUR), ou neutral.
Score de -1 (très bearish) à 1 (très bullish).

Titres:
${headlines}

Réponds UNIQUEMENT en JSON array:
[
  {"index": 0, "sentiment": "bullish|bearish|neutral", "score": -1 à 1, "confidence": 0-100, "impact": "low|medium|high"},
  ...
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.2, maxOutputTokens: 1024 },
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const sentiments = JSON.parse(jsonMatch[0]);

      return articles.map((article, index) => {
        const sentiment = sentiments.find((s: any) => s.index === index);
        if (sentiment) {
          return {
            ...article,
            sentiment: {
              score: sentiment.score,
              label: sentiment.sentiment,
              confidence: sentiment.confidence,
            },
            impact: sentiment.impact,
          };
        }
        return article;
      });
    }
  } catch (error) {
    console.error('[News] Erreur analyse sentiment:', error);
  }

  return articles;
}

/**
 * Calcule le sentiment global du marché
 */
export async function getMarketSentiment(): Promise<MarketSentiment> {
  const news = await fetchForexNews();

  if (news.length === 0) {
    return {
      overall: 'neutral',
      score: 0,
      eurSentiment: 0,
      usdSentiment: 0,
      newsCount: 0,
      lastUpdate: new Date(),
      topBullishFactors: [],
      topBearishFactors: [],
    };
  }

  const withSentiment = news.filter((n) => n.sentiment);
  const totalScore = withSentiment.reduce((sum, n) => sum + (n.sentiment?.score || 0), 0);
  const avgScore = withSentiment.length > 0 ? totalScore / withSentiment.length : 0;

  const bullishNews = withSentiment
    .filter((n) => n.sentiment?.label === 'bullish')
    .sort((a, b) => (b.sentiment?.score || 0) - (a.sentiment?.score || 0));

  const bearishNews = withSentiment
    .filter((n) => n.sentiment?.label === 'bearish')
    .sort((a, b) => (a.sentiment?.score || 0) - (b.sentiment?.score || 0));

  return {
    overall: avgScore > 0.2 ? 'bullish' : avgScore < -0.2 ? 'bearish' : 'neutral',
    score: Math.round(avgScore * 100),
    eurSentiment: Math.round(avgScore * 50 + 50),
    usdSentiment: Math.round(-avgScore * 50 + 50),
    newsCount: news.length,
    lastUpdate: new Date(),
    topBullishFactors: bullishNews.slice(0, 3).map((n) => n.headline),
    topBearishFactors: bearishNews.slice(0, 3).map((n) => n.headline),
  };
}

/**
 * Récupère les news à fort impact
 */
export async function getHighImpactNews(): Promise<NewsArticle[]> {
  const news = await fetchForexNews();
  return news.filter((n) => n.impact === 'high' || n.category === 'central_bank');
}

/**
 * News de fallback quand l'API n'est pas disponible
 */
function getFallbackNews(): NewsArticle[] {
  const now = new Date();

  return [
    {
      id: 'fb_1',
      headline: 'EUR/USD : La BCE maintient sa politique monétaire restrictive',
      summary: 'La Banque Centrale Européenne a confirmé son engagement à maintenir des taux élevés pour combattre l\'inflation.',
      source: 'Trading IA',
      url: '#',
      datetime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      category: 'central_bank',
      related: ['EUR/USD'],
      sentiment: { score: -0.3, label: 'bearish', confidence: 70 },
      impact: 'high',
    },
    {
      id: 'fb_2',
      headline: 'Les données économiques US dépassent les attentes',
      summary: 'Les chiffres de l\'emploi américain montrent une économie résiliente, renforçant le dollar.',
      source: 'Trading IA',
      url: '#',
      datetime: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      category: 'economy',
      related: ['EUR/USD', 'USD'],
      sentiment: { score: -0.4, label: 'bearish', confidence: 75 },
      impact: 'medium',
    },
    {
      id: 'fb_3',
      headline: 'Zone Euro : L\'inflation ralentit plus vite que prévu',
      summary: 'L\'indice des prix à la consommation en zone euro affiche une baisse significative.',
      source: 'Trading IA',
      url: '#',
      datetime: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      category: 'economy',
      related: ['EUR/USD', 'EUR'],
      sentiment: { score: 0.2, label: 'bullish', confidence: 65 },
      impact: 'medium',
    },
    {
      id: 'fb_4',
      headline: 'Les traders anticipent une pause de la Fed',
      summary: 'Les marchés intègrent de plus en plus une fin du cycle de hausse des taux américains.',
      source: 'Trading IA',
      url: '#',
      datetime: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      category: 'central_bank',
      related: ['EUR/USD', 'USD'],
      sentiment: { score: 0.5, label: 'bullish', confidence: 80 },
      impact: 'high',
    },
    {
      id: 'fb_5',
      headline: 'EUR/USD : Analyse technique - Support majeur testé',
      summary: 'La paire EUR/USD teste un niveau de support clé à 1.0800.',
      source: 'Trading IA',
      url: '#',
      datetime: new Date(now.getTime() - 10 * 60 * 60 * 1000),
      category: 'forex',
      related: ['EUR/USD'],
      sentiment: { score: 0.1, label: 'neutral', confidence: 60 },
      impact: 'low',
    },
  ];
}

/**
 * Analyse une actualité spécifique avec Gemini
 */
export async function analyzeNewsArticle(article: NewsArticle): Promise<{
  analysis: string;
  tradingImplication: string;
  recommendedAction: 'buy' | 'sell' | 'hold';
  confidence: number;
}> {
  const config = getAPIConfig();

  if (!config.gemini.apiKey) {
    return {
      analysis: 'Clé API Gemini non configurée',
      tradingImplication: 'Analyse non disponible',
      recommendedAction: 'hold',
      confidence: 0,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

    const prompt = `Analyse cette actualité financière pour le trading EUR/USD:

Titre: ${article.headline}
Résumé: ${article.summary}
Source: ${article.source}
Catégorie: ${article.category}

Fournis:
1. Une analyse détaillée de l'impact sur EUR/USD (2-3 phrases)
2. L'implication pour le trading (1-2 phrases)
3. Recommandation: buy, sell, ou hold
4. Niveau de confiance (0-100)

Réponds en JSON:
{
  "analysis": "...",
  "tradingImplication": "...",
  "recommendedAction": "buy|sell|hold",
  "confidence": 0-100
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.3, maxOutputTokens: 512 },
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('[News] Erreur analyse article:', error);
  }

  return {
    analysis: 'Erreur lors de l\'analyse',
    tradingImplication: 'Non disponible',
    recommendedAction: 'hold',
    confidence: 0,
  };
}
