import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, AlertTriangleIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  status?: "positive" | "negative" | "neutral";
}

const MetricCard = ({ title, value, change, icon, status = "neutral" }: MetricCardProps) => {
  const statusColors = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-gray-500"
  };

  return (
    <Card className="glass-card hover:scale-105 transition-transform">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs flex items-center mt-1 ${statusColors[status]}`}>
            {change > 0 ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
            {Math.abs(change).toFixed(2)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default function MetricsOverview() {
  // Récupérer les métriques globales
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['globalMetrics'],
    queryFn: async () => {
      // Récupérer les dernières métriques
      const { data: agentMetrics } = await supabase
        .from('agent_metrics')
        .select('weekly_return_percentage, cumulative_return_percentage, win_rate_percentage, max_drawdown_percentage')
        .order('last_updated', { ascending: false });

      // Calculer les moyennes
      if (!agentMetrics || agentMetrics.length === 0) {
        return {
          avgWeeklyReturn: 0,
          totalReturn: 0,
          avgWinRate: 0,
          maxDrawdown: 0
        };
      }

      const avgWeeklyReturn = agentMetrics.reduce((sum, m) => sum + (m.weekly_return_percentage || 0), 0) / agentMetrics.length;
      const totalReturn = Math.max(...agentMetrics.map(m => m.cumulative_return_percentage || 0));
      const avgWinRate = agentMetrics.reduce((sum, m) => sum + (m.win_rate_percentage || 0), 0) / agentMetrics.length;
      const maxDrawdown = Math.max(...agentMetrics.map(m => m.max_drawdown_percentage || 0));

      return {
        avgWeeklyReturn,
        totalReturn,
        avgWinRate,
        maxDrawdown
      };
    },
    refetchInterval: 30000 // Rafraîchir toutes les 30 secondes
  });

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="glass-card animate-pulse">
            <CardHeader className="h-20"></CardHeader>
            <CardContent className="h-16"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Rendement Hebdo Moyen"
        value={`${metrics.avgWeeklyReturn.toFixed(2)}%`}
        change={metrics.avgWeeklyReturn}
        icon={<TrendingUpIcon className="h-4 w-4 text-muted-foreground" />}
        status={metrics.avgWeeklyReturn > 0 ? "positive" : "negative"}
      />
      
      <MetricCard
        title="Rendement Total"
        value={`${metrics.totalReturn.toFixed(2)}%`}
        change={metrics.totalReturn}
        icon={<TrendingUpIcon className="h-4 w-4 text-muted-foreground" />}
        status={metrics.totalReturn > 0 ? "positive" : "negative"}
      />
      
      <MetricCard
        title="Win Rate Moyen"
        value={`${metrics.avgWinRate.toFixed(1)}%`}
        icon={<TrendingUpIcon className="h-4 w-4 text-muted-foreground" />}
        status={metrics.avgWinRate > 60 ? "positive" : metrics.avgWinRate > 50 ? "neutral" : "negative"}
      />
      
      <MetricCard
        title="Max Drawdown"
        value={`${metrics.maxDrawdown.toFixed(2)}%`}
        icon={<AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />}
        status={metrics.maxDrawdown > 10 ? "negative" : "neutral"}
      />
    </div>
  );
}
