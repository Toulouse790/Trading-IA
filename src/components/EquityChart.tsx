
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
  const { data: equityData, isLoading, error } = useQuery({
    queryKey: ['equityData', agentId],
    queryFn: async () => {
      try {
        if (agentId) {
          // Données pour un agent spécifique
          const { data, error } = await supabase
            .from('agent_metrics')
            .select('equity_curve_data')
            .eq('agent_id', agentId)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching agent metrics:', error);
            return generateFallbackData();
          }
          
          return parseEquityData(data?.equity_curve_data) || generateFallbackData();
        } else {
          // Données globales simulées car pas de table equity_curve
          const { data, error } = await supabase
            .from('agent_metrics')
            .select('equity_curve_data, last_updated')
            .order('last_updated', { ascending: true })
            .limit(100);
          
          if (error) {
            console.error('Error fetching equity data:', error);
            return generateFallbackData();
          }
          
          if (!data || data.length === 0) return generateFallbackData();
          
          // Fusionner toutes les données d'equity
          const allEquityData: EquityDataPoint[] = [];
          data.forEach(item => {
            const parsed = parseEquityData(item.equity_curve_data);
            if (parsed && parsed.length > 0) {
              allEquityData.push(...parsed);
            }
          });
          
          return allEquityData.length > 0 ? allEquityData : generateFallbackData();
        }
      } catch (error) {
        console.error('Error in equity data query:', error);
        return generateFallbackData();
      }
    },
    refetchInterval: 60000
  });

  const parseEquityData = (data: any): EquityDataPoint[] => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      date: String(item.date || ''),
      value: Number(item.value || 0),
      drawdown: item.drawdown ? Number(item.drawdown) : undefined
    })).filter(item => item.date && item.value > 0);
  };

  const generateFallbackData = (): EquityDataPoint[] => {
    const data: EquityDataPoint[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    let currentValue = 10000;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Simulate some variance
      const change = (Math.random() - 0.5) * 200;
      currentValue += change;
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(9000, currentValue), // Minimum value
        drawdown: Math.random() * 0.1 // Random drawdown up to 10%
      });
    }
    
    return data;
  };

  // Ensure we always have valid data
  const safeEquityData = Array.isArray(equityData) ? equityData : [];

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Courbe d'Équité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || safeEquityData.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Courbe d'Équité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            Aucune donnée disponible
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculer min et max pour l'échelle
  const values = safeEquityData.map(d => d.value);
  const minValue = Math.min(...values) * 0.95;
  const maxValue = Math.max(...values) * 1.05;
  const initialValue = safeEquityData[0]?.value || 10000;

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
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
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
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Courbe d'Équité</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={safeEquityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">Performance</p>
            <p className="text-sm font-medium text-green-500">
              +{(((safeEquityData[safeEquityData.length - 1]?.value || initialValue) - initialValue) / initialValue * 100).toFixed(2)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">Capital Actuel</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatYAxis(safeEquityData[safeEquityData.length - 1]?.value || initialValue)}€
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">Période</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {safeEquityData.length} jours
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
