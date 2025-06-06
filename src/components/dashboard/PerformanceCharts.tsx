
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';

interface PerformanceChartsProps {
  priceData: any[];
  performanceData: any[];
}

export const PerformanceCharts = ({ priceData, performanceData }: PerformanceChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
      {/* Graphique de prix */}
      <div className="bg-[#1F1F1E] rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-[#3A3935]/50">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#8989DE]" />
          <span className="truncate">Évolution du Prix</span>
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={priceData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8989DE" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8989DE" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#3A3935" />
            <XAxis 
              dataKey="time" 
              stroke="#605F5B" 
              fontSize={10}
              tickMargin={5}
            />
            <YAxis 
              stroke="#605F5B" 
              domain={['dataMin - 0.002', 'dataMax + 0.002']}
              fontSize={10}
              tickMargin={5}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F1F1E', 
                border: '1px solid #3A3935',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#8989DE" 
              fillOpacity={1} 
              fill="url(#colorPrice)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Performance par jour */}
      <div className="bg-[#1F1F1E] rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-[#3A3935]/50">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#7EBF8E]" />
          <span className="truncate">Performance des Entraînements</span>
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3A3935" />
            <XAxis 
              dataKey="day" 
              stroke="#605F5B"
              fontSize={10}
              tickMargin={5}
            />
            <YAxis 
              stroke="#605F5B"
              fontSize={10}
              tickMargin={5}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F1F1E', 
                border: '1px solid #3A3935',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar 
              dataKey="profit" 
              fill="#8989DE"
              radius={[4, 4, 0, 0]}
            >
              {performanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.profit > 0 ? '#7EBF8E' : '#EF4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
