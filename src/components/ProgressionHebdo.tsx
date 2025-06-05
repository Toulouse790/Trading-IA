
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "lucide-react";

const useWeeklyStats = () => {
  return useQuery({
    queryKey: ['weekly_stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_stats_by_week')
        .select('*')
        .order('week', { ascending: true });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
  });
};

export default function ProgressionHebdo() {
  const { data: weeklyStats, isLoading } = useWeeklyStats();

  const chartData = weeklyStats?.map(stat => ({
    week: stat.week ? format(new Date(stat.week), "dd/MM", { locale: fr }) : "N/A",
    avgWinRate: stat.avg_win_rate || 0,
    totalRuns: stat.total_runs || 0,
    fullDate: stat.week
  })) || [];

  const chartConfig = {
    avgWinRate: {
      label: "Win Rate Moyen (%)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Progression Hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Progression Hebdomadaire
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">Aucune donnée hebdomadaire</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="avgWinRate" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
