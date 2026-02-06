/**
 * Configuration des APIs pour données réelles
 * Les clés sont chargées depuis les variables d'environnement ou localStorage
 */

export interface APIConfig {
  twelveData: {
    apiKey: string | null;
    baseUrl: string;
    rateLimit: number; // requêtes par minute
  };
  finnhub: {
    apiKey: string | null;
    baseUrl: string;
    wsUrl: string;
  };
  alphaVantage: {
    apiKey: string | null;
    baseUrl: string;
  };
  exchangeRate: {
    baseUrl: string; // API gratuite sans clé
  };
  forexFactory: {
    baseUrl: string; // Calendrier économique
  };
  gemini: {
    apiKey: string | null;
  };
}

// Charger les clés depuis localStorage ou env
const getApiKey = (key: string): string | null => {
  // D'abord vérifier localStorage
  const stored = localStorage.getItem(`trading_ia_${key}`);
  if (stored) return stored;

  // Puis les variables d'environnement
  const envKey = (import.meta as any).env?.[`VITE_${key.toUpperCase()}`];
  if (envKey) return envKey;

  // Pour Gemini, vérifier aistudio
  if (key === 'gemini_api_key' && typeof window !== 'undefined' && (window as any).aistudio?.apiKey) {
    return (window as any).aistudio.apiKey;
  }

  return null;
};

// Sauvegarder une clé API
export const saveApiKey = (key: string, value: string): void => {
  localStorage.setItem(`trading_ia_${key}`, value);
};

// Supprimer une clé API
export const removeApiKey = (key: string): void => {
  localStorage.removeItem(`trading_ia_${key}`);
};

// Vérifier si une API est configurée
export const isApiConfigured = (api: keyof APIConfig): boolean => {
  const config = getAPIConfig();
  if (api === 'exchangeRate' || api === 'forexFactory') return true;
  return config[api].apiKey !== null;
};

// Configuration principale
export const getAPIConfig = (): APIConfig => ({
  twelveData: {
    apiKey: getApiKey('twelve_data_api_key'),
    baseUrl: 'https://api.twelvedata.com',
    rateLimit: 8, // 8 req/min pour plan gratuit (800/jour)
  },
  finnhub: {
    apiKey: getApiKey('finnhub_api_key'),
    baseUrl: 'https://finnhub.io/api/v1',
    wsUrl: 'wss://ws.finnhub.io',
  },
  alphaVantage: {
    apiKey: getApiKey('alpha_vantage_api_key'),
    baseUrl: 'https://www.alphavantage.co/query',
  },
  exchangeRate: {
    baseUrl: 'https://api.exchangerate-api.com/v4/latest',
  },
  forexFactory: {
    baseUrl: 'https://nfs.faireconomy.media/ff_calendar_thisweek.json',
  },
  gemini: {
    apiKey: getApiKey('gemini_api_key'),
  },
});

// Liste des APIs disponibles avec leur statut
export interface APIStatus {
  name: string;
  key: string;
  configured: boolean;
  description: string;
  freeLimit: string;
  required: boolean;
}

export const getAPIStatus = (): APIStatus[] => {
  const config = getAPIConfig();

  return [
    {
      name: 'Twelve Data',
      key: 'twelve_data_api_key',
      configured: config.twelveData.apiKey !== null,
      description: 'Données historiques Forex (OHLCV)',
      freeLimit: '800 req/jour',
      required: false,
    },
    {
      name: 'Finnhub',
      key: 'finnhub_api_key',
      configured: config.finnhub.apiKey !== null,
      description: 'News financières et WebSocket temps réel',
      freeLimit: '60 req/min',
      required: false,
    },
    {
      name: 'Alpha Vantage',
      key: 'alpha_vantage_api_key',
      configured: config.alphaVantage.apiKey !== null,
      description: 'Indicateurs techniques pré-calculés',
      freeLimit: '5 req/min',
      required: false,
    },
    {
      name: 'Google Gemini',
      key: 'gemini_api_key',
      configured: config.gemini.apiKey !== null,
      description: 'Analyse IA et signaux de trading',
      freeLimit: 'Gratuit avec quota',
      required: true,
    },
  ];
};

export default getAPIConfig;
