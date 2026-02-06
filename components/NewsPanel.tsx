/**
 * Composant Panel d'Actualités avec Sentiment
 * Affiche les news financières et leur analyse de sentiment
 */

import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  RefreshCw,
  Filter,
  Zap,
  AlertCircle,
  Clock,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import {
  fetchForexNews,
  getMarketSentiment,
  getHighImpactNews,
  analyzeNewsArticle,
  NewsArticle,
  MarketSentiment,
} from '../services/realtime/newsService';

interface NewsPanelProps {
  compact?: boolean;
  maxNews?: number;
}

const NewsPanel: React.FC<NewsPanelProps> = ({
  compact = false,
  maxNews = 10,
}) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
  const [filter, setFilter] = useState<'all' | 'high_impact' | 'bullish' | 'bearish'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [articleAnalysis, setArticleAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadNews();
    loadSentiment();

    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(() => {
      loadNews();
      loadSentiment();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const data = await fetchForexNews();
      setNews(data);
    } catch (error) {
      console.error('Erreur chargement news:', error);
    }
    setIsLoading(false);
  };

  const loadSentiment = async () => {
    try {
      const data = await getMarketSentiment();
      setSentiment(data);
    } catch (error) {
      console.error('Erreur chargement sentiment:', error);
    }
  };

  const analyzeArticle = async (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsAnalyzing(true);
    setArticleAnalysis(null);

    try {
      const analysis = await analyzeNewsArticle(article);
      setArticleAnalysis(analysis);
    } catch (error) {
      console.error('Erreur analyse article:', error);
    }

    setIsAnalyzing(false);
  };

  const filteredNews = news.filter((article) => {
    if (filter === 'all') return true;
    if (filter === 'high_impact') return article.impact === 'high';
    if (filter === 'bullish') return article.sentiment?.label === 'bullish';
    if (filter === 'bearish') return article.sentiment?.label === 'bearish';
    return true;
  }).slice(0, maxNews);

  const getSentimentIcon = (label?: string) => {
    switch (label) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (label?: string) => {
    switch (label) {
      case 'bullish':
        return 'text-emerald-400 bg-emerald-500/20';
      case 'bearish':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours > 24) {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
    if (hours > 0) {
      return `il y a ${hours}h`;
    }
    return `il y a ${minutes}min`;
  };

  if (compact) {
    return (
      <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-white flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-blue-400" />
            News
          </h4>
          {sentiment && (
            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getSentimentColor(sentiment.overall)}`}>
              {getSentimentIcon(sentiment.overall)}
              {sentiment.score > 0 ? '+' : ''}{sentiment.score}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNews.slice(0, 3).map((article) => (
              <div key={article.id} className="flex items-start gap-2 text-sm">
                {getSentimentIcon(article.sentiment?.label)}
                <span className="text-white truncate flex-1">{article.headline}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-400" />
            Actualités & Sentiment
          </h3>

          <button
            onClick={loadNews}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Sentiment global */}
        {sentiment && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Sentiment Global</p>
              <div className="flex items-center justify-center gap-2">
                {getSentimentIcon(sentiment.overall)}
                <span className={`font-bold ${
                  sentiment.overall === 'bullish' ? 'text-emerald-400' :
                  sentiment.overall === 'bearish' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {sentiment.score > 0 ? '+' : ''}{sentiment.score}
                </span>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">EUR</p>
              <div className="flex items-center justify-center gap-1">
                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${sentiment.eurSentiment}%` }}
                  />
                </div>
                <span className="text-xs text-white">{sentiment.eurSentiment}</span>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">USD</p>
              <div className="flex items-center justify-center gap-1">
                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${sentiment.usdSentiment}%` }}
                  />
                </div>
                <span className="text-xs text-white">{sentiment.usdSentiment}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: 'all', label: 'Toutes' },
            { key: 'high_impact', label: 'Fort impact' },
            { key: 'bullish', label: 'Bullish' },
            { key: 'bearish', label: 'Bearish' },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f.key
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des news */}
      <div className="max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-500 animate-spin" />
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune actualité</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredNews.map((article) => (
              <div
                key={article.id}
                className="p-4 hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => analyzeArticle(article)}
              >
                <div className="flex items-start gap-3">
                  {/* Sentiment indicator */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getSentimentColor(article.sentiment?.label)}`}>
                    {getSentimentIcon(article.sentiment?.label)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium mb-1 line-clamp-2">
                      {article.headline}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(article.datetime)}
                      </span>
                      <span>{article.source}</span>
                      {article.impact && (
                        <span className={`px-1.5 py-0.5 rounded ${
                          article.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                          article.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {article.impact === 'high' ? 'Fort' : article.impact === 'medium' ? 'Moyen' : 'Faible'}
                        </span>
                      )}
                    </div>

                    {/* Sentiment score */}
                    {article.sentiment && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              article.sentiment.label === 'bullish' ? 'bg-emerald-500' :
                              article.sentiment.label === 'bearish' ? 'bg-red-500' : 'bg-gray-500'
                            }`}
                            style={{
                              width: `${((article.sentiment.score + 1) / 2) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {article.sentiment.confidence}%
                        </span>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'analyse détaillée */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getSentimentColor(selectedArticle.sentiment?.label)}`}>
                  {getSentimentIcon(selectedArticle.sentiment?.label)}
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">
                {selectedArticle.headline}
              </h3>

              <p className="text-gray-400 mb-4">{selectedArticle.summary}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span>{selectedArticle.source}</span>
                <span>{formatTimeAgo(selectedArticle.datetime)}</span>
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:underline"
                >
                  Lire <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Analyse IA */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="font-medium text-white flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Analyse IA
                </h4>

                {isAnalyzing ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
                  </div>
                ) : articleAnalysis ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Analyse</p>
                      <p className="text-gray-300">{articleAnalysis.analysis}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Implication Trading</p>
                      <p className="text-gray-300">{articleAnalysis.tradingImplication}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Recommandation</p>
                        <span className={`px-3 py-1 rounded-lg font-medium ${
                          articleAnalysis.recommendedAction === 'buy' ? 'bg-emerald-500/20 text-emerald-400' :
                          articleAnalysis.recommendedAction === 'sell' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {articleAnalysis.recommendedAction === 'buy' ? 'ACHAT' :
                           articleAnalysis.recommendedAction === 'sell' ? 'VENTE' : 'ATTENDRE'}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">Confiance</p>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${articleAnalysis.confidence}%` }}
                            />
                          </div>
                          <span className="text-white font-medium">{articleAnalysis.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Analyse non disponible
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 bg-gray-900/30">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{filteredNews.length} actualités</span>
          <span>Sentiment analysé par IA</span>
        </div>
      </div>
    </div>
  );
};

export default NewsPanel;
