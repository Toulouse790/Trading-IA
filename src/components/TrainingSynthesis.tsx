
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrainingLog } from "@/hooks/useTrainingLogs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TrainingSynthesisProps {
  trainings: TrainingLog[];
}

export default function TrainingSynthesis({ trainings }: TrainingSynthesisProps) {
  // Données pour le graphique de win rate dans le temps
  const winRateData = trainings
    .filter(t => t.training_date && t.win_rate)
    .map(training => ({
      date: format(new Date(training.training_date), "dd/MM", { locale: fr }),
      winRate: training.win_rate,
      fullDate: training.training_date
    }))
    .reverse(); // Pour avoir les dates dans l'ordre chronologique

  // Top 3 patterns par profit moyen
  const patternsMap = new Map<string, { profit: number, count: number }>();
  
  trainings.forEach(training => {
    if (training.best_pattern_name && training.best_pattern_profit) {
      const existing = patternsMap.get(training.best_pattern_name) || { profit: 0, count: 0 };
      existing.profit += training.best_pattern_profit;
      existing.count += 1;
      patternsMap.set(training.best_pattern_name, existing);
    }
  });

  const topPatterns = Array.from(patternsMap.entries())
    .map(([name, data]) => ({
      pattern: name,
      avgProfit: data.profit / data.count,
      count: data.count
    }))
    .sort((a, b) => b.avgProfit - a.avgProfit)
    .slice(0, 3);

  // Calcul des moyennes
  const validTrainings = trainings.filter(t => 
    t.sharpe_ratio !== null && 
    t.max_consecutive_losses !== null && 
    t.avg_rr_ratio !== null
  );

  const avgSharpeRatio = validTrainings.length > 0 
    ? validTrainings.reduce((sum, t) => sum + (t.sharpe_ratio || 0), 0) / validTrainings.length 
    : 0;

  const avgDrawdown = validTrainings.length > 0 
    ? validTrainings.reduce((sum, t) => sum + (t.max_consecutive_losses || 0), 0) / validTrainings.length 
    : 0;

  const avgRR = validTrainings.length > 0 
    ? validTrainings.reduce((sum, t) => sum + (t.avg_rr_ratio || 0), 0) / validTrainings.length 
    : 0;

  const chartConfig = {
    winRate: {
      label: "Win Rate (%)",
    },
    avgProfit: {
      label: "Profit Moyen (%)",
    },
  };

  return (
    <div className="space-y-6">
      {/* Métriques moyennes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{avgSharpeRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Sharpe Ratio Moyen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{avgDrawdown.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Drawdown Moyen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{avgRR.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">RR Moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique Win Rate dans le temps */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution du Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={winRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="winRate" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top 3 Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Top 3 Patterns par Profit Moyen</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pattern" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="avgProfit" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
