// src/components/MarketStats.tsx
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon, ActivityIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton"; // Pour l'état de chargement

interface GlobalMarketData {
  data: {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number };
    market_cap_change_percentage_24h_usd: number;
  };
}

const fetchGlobalMarketData = async (): Promise<GlobalMarketData> => {
  const response = await fetch('https://api.coingecko.com/api/v3/global');
  if (!response.ok) {
    throw new Error('Network response was not ok for global market data');
  }
  return response.json();
};

const formatLargeNumber = (num: number | undefined): string => {
  if (num === undefined) return "N/A";
  if (num >= 1e12) {
    return `$${(num / 1e12).toFixed(2)}T`;
  }
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(1)}B`;
  }
  if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(1)}M`;
  }
  return `$${num?.toLocaleString()}`;
};

const formatPercentage = (num: number | undefined): string => {
  if (num === undefined) return "N/A";
  return `${num.toFixed(1)}%`;
};

const MarketStats = () => {
  const { data: globalData, isLoading, error } = useQuery<GlobalMarketData, Error>({
    queryKey: ['globalMarketData'],
    queryFn: fetchGlobalMarketData,
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card p-6 rounded-lg">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-lg col-span-1 md:col-span-3 bg-destructive/20 border-destructive">
          <p className="text-destructive-foreground">Erreur de chargement des stats globales: {error.message}</p>
        </div>
      </div>
    )
  }

  const marketCap = globalData?.data?.total_market_cap?.usd;
  const volume24h = globalData?.data?.total_volume?.usd;
  const btcDominance = globalData?.data?.market_cap_percentage?.btc;
  const marketCapChange24h = globalData?.data?.market_cap_change_percentage_24h_usd;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Market Cap</h3>
          {marketCapChange24h !== undefined && marketCapChange24h >= 0 ? (
            <TrendingUpIcon className="w-4 h-4 text-success" />
          ) : (
            <TrendingDownIcon className="w-4 h-4 text-warning" />
          )}
        </div>
        <p className="text-2xl font-semibold mt-2">{formatLargeNumber(marketCap)}</p>
        {marketCapChange24h !== undefined && (
           <span className={`text-sm flex items-center gap-1 ${marketCapChange24h >= 0 ? 'text-success' : 'text-warning'}`}>
            {marketCapChange24h >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            {formatPercentage(Math.abs(marketCapChange24h))}
          </span>
        )}
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">24h Volume</h3>
          <TrendingUpIcon className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-semibold mt-2">{formatLargeNumber(volume24h)}</p>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">BTC Dominance</h3>
          <ActivityIcon className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-semibold mt-2">{formatPercentage(btcDominance)}</p>
      </div>
    </div>
  );
};

export default MarketStats;
