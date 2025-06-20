
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrainingLog } from "@/hooks/useTrainingLogs";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

interface SimpleDashboardProps {
  logs: TrainingLog[];
}

export default function SimpleDashboard({ logs }: SimpleDashboardProps) {
  const latestLog = logs[0];
  
  const averageWinRate = logs.length > 0 
    ? logs.reduce((sum, log) => sum + log.win_rate, 0) / logs.length 
    : 0;

  const totalTrades = logs.reduce((sum, log) => sum + log.total_trades_analyzed, 0);
  
  const averageProfit = logs.length > 0 
    ? logs.reduce((sum, log) => sum + log.best_pattern_profit, 0) / logs.length 
    : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Tableau de Bord Simple</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate Actuel</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestLog ? `${latestLog.win_rate.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Dernier entraînement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageWinRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Sur {logs.length} entraînements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrades.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Trades analysés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Moyen</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${averageProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {averageProfit > 0 ? '+' : ''}{averageProfit.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Par pattern
            </p>
          </CardContent>
        </Card>
      </div>

      {latestLog && (
        <Card>
          <CardHeader>
            <CardTitle>Dernier Entraînement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium">Pattern Principal</p>
                <p className="text-lg">{latestLog.best_pattern_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Sharpe Ratio</p>
                <p className="text-lg">{latestLog.sharpe_ratio.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Modèle</p>
                <p className="text-lg">{latestLog.model_version}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Assistant</p>
                <p className="text-lg">{latestLog.assistant_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
