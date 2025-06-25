
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ActivityIcon, PauseCircleIcon, PlayCircleIcon, ZapIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface SystemStatus {
  trading_enabled: boolean;
  active_positions: number;
  daily_trades: number;
  daily_limit: number;
  current_session: string;
  system_health: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  last_trade_time?: string;
}

export default function TradingStatus() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mettre à jour l'heure toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Récupérer le statut du système
  const { data: status, isLoading } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: async () => {
      try {
        // Récupérer les agents actifs
        const { data: agents } = await supabase
          .from('agents')
          .select('status')
          .eq('status', 'Actif');
        
        // Pour les trades, nous utilisons les données existantes disponibles
        // Vous pouvez ajuster selon vos tables disponibles
        const { data: trainingLogs } = await supabase
          .from('training_logs')
          .select('*')
          .gte('created_at', new Date().toISOString().split('T')[0])
          .limit(10);

        const hour = new Date().getUTCHours();
        let session = 'CLOSED';
        if (hour >= 0 && hour < 7) session = 'ASIAN';
        else if (hour >= 7 && hour < 9) session = 'LONDON_OPEN';
        else if (hour >= 9 && hour < 12) session = 'LONDON';
        else if (hour >= 12 && hour < 16) session = 'NY_OVERLAP';
        else if (hour >= 16 && hour < 21) session = 'NEW_YORK';

        // Simuler quelques données pour la démo
        const activePositions = Math.floor(Math.random() * 5);
        const dailyTrades = trainingLogs?.length || Math.floor(Math.random() * 8);

        return {
          trading_enabled: agents && agents.length > 0,
          active_positions: activePositions,
          daily_trades: dailyTrades,
          daily_limit: 10,
          current_session: session,
          system_health: 'HEALTHY' as const,
          last_trade_time: trainingLogs?.[0]?.created_at
        } as SystemStatus;
      } catch (error) {
        console.error('Erreur lors de la récupération du statut:', error);
        // Retourner des données par défaut en cas d'erreur
        return {
          trading_enabled: false,
          active_positions: 0,
          daily_trades: 0,
          daily_limit: 10,
          current_session: 'CLOSED',
          system_health: 'WARNING' as const
        } as SystemStatus;
      }
    },
    refetchInterval: 5000
  });

  const getSessionColor = (session: string) => {
    switch (session) {
      case 'LONDON_OPEN':
      case 'LONDON':
        return 'text-blue-500';
      case 'NY_OVERLAP':
        return 'text-green-500';
      case 'NEW_YORK':
        return 'text-orange-500';
      case 'ASIAN':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'HEALTHY':
        return 'bg-green-500';
      case 'WARNING':
        return 'bg-yellow-500';
      case 'CRITICAL':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading || !status) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Statut Trading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const tradingProgress = (status.daily_trades / status.daily_limit) * 100;

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <ActivityIcon className="h-5 w-5" />
            Statut Trading
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${getHealthColor(status.system_health)} animate-pulse`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">{status.system_health}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* État du trading */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status.trading_enabled ? (
              <>
                <PlayCircleIcon className="h-5 w-5 text-green-500" />
                <span className="font-medium text-gray-900 dark:text-white">Trading Actif</span>
              </>
            ) : (
              <>
                <PauseCircleIcon className="h-5 w-5 text-red-500" />
                <span className="font-medium text-gray-900 dark:text-white">Trading Suspendu</span>
              </>
            )}
          </div>
          <Badge variant={status.trading_enabled ? "default" : "secondary"}>
            {status.active_positions} position{status.active_positions !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Session de marché */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Session actuelle</span>
            <span className={`font-medium ${getSessionColor(status.current_session)}`}>
              {status.current_session}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Heure UTC</span>
            <span className="font-mono text-gray-900 dark:text-white">{currentTime.toUTCString().split(' ')[4]}</span>
          </div>
        </div>

        {/* Limite quotidienne */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Trades aujourd'hui</span>
            <span className="font-medium text-gray-900 dark:text-white">{status.daily_trades} / {status.daily_limit}</span>
          </div>
          <Progress value={tradingProgress} className="h-2" />
          {tradingProgress >= 80 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
              <ZapIcon className="h-3 w-3" />
              Approche de la limite quotidienne
            </p>
          )}
        </div>

        {/* Dernier trade */}
        {status.last_trade_time && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Dernier trade: {new Date(status.last_trade_time).toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
