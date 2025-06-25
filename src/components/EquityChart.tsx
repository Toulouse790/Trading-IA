
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EquityDataPoint {
  date: string;
  value: number;
  drawdown?: number;
}

interface EquityChartProps {
  agentId?: string;
  height?: number;
}

export default function EquityChart({ agentId, height = 300 }: EquityChartProps) {
  // Récupérer les données d'equity
  const { data: equityData, isLoading } = useQuery({
    queryKey: ['equityData', agentId],
    queryFn: async () => {
      if (agentId) {
        // Données pour un agent spécifique
        const { data } = await supabase
          .from('agent_metrics')
          .select('equity_curve_data')
          .eq('agent_id', agentId)
          .maybeSingle();
        
        return parseEquityData(data?.equity_curve_data);
      } else {
        // Données globales simulées car pas de table equity_curve
        const { data } = await supabase
          .from('agent_metrics')
          .select('equity_curve_data, last_updated')
          .order('last_updated', { ascending: true })
          .limit(100);
        
        if (!data || data.length === 0) return [];
        
        // Fusionner toutes les données d'equity
        const allEquityData: EquityDataPoint[] = [];
        data.forEach(item => {
          const parsed = parseEquityData(item.equity_curve_data);
          allEquityData.push(...parsed);
        });
        
        return allEquityData;
      }
    },
    refetchInterval: 60000
  });

  const parseEquityData = (data: any): EquityDataPoint[] => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      date: String(item.date),
      value: Number(item.value),
      drawdown: item.drawdown
    }));
  };

  if (isLoading || !equityData || equityData.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Courbe d'Équité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {isLoading ? "Chargement..." : "Aucune donnée disponible"}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculer min et max pour l'échelle
  const values = equityData.map(d => d.value);
  const minValue = Math.min(...values) * 0.95;
  const maxValue = Math.max(...values) * 1.05;
  const initialValue = equityData[0]?.value || 10000;

  // Formatter pour l'axe Y
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toFixed(0);
  };

  // Formatter pour le tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-green-500">
            Valeur: {payload[0].value.toFixed(2)}€
          </p>
          {payload[0].payload.drawdown && (
            <p className="text-sm text-red-500">
              Drawdown: {(payload[0].payload.drawdown * 100).toFixed(2)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Courbe d'Équité</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={equityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#888"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#888"
              tick={{ fontSize: 12 }}
              domain={[minValue, maxValue]}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Ligne de référence au capital initial */}
            <ReferenceLine 
              y={initialValue} 
              stroke="#666" 
              strokeDasharray="3 3"
              label={{ value: "Initial", position: "left", fill: "#666", fontSize: 12 }}
            />
            
            {/* Courbe d'équité */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Performance</p>
            <p className="text-sm font-medium text-green-500">
              +{(((equityData[equityData.length - 1].value - initialValue) / initialValue) * 100).toFixed(2)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Capital Actuel</p>
            <p className="text-sm font-medium">
              {formatYAxis(equityData[equityData.length - 1].value)}€
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Période</p>
            <p className="text-sm font-medium">
              {equityData.length} jours
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
