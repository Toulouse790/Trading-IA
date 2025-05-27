// src/components/AgentCard.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon, TrendingDownIcon, ActivityIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'; // Assurez-vous que recharts est installé

export interface EquityDataPoint {
  date: string; // ou number (timestamp)
  value: number;
}

export interface Agent {
  id: string;
  agent_name: string;
  currency_pair: string;
  timeframe: string;
  weekly_return_percentage: number | null;
  cumulative_return_percentage: number | null;
  max_drawdown_percentage: number | null;
  current_drawdown_percentage: number | null;
  win_rate_percentage: number | null;
  status: "Opérationnel" | "En Test" | "Optimisation" | "Inactif";
  equity_curve_data: EquityDataPoint[] | null;
  last_updated: string; // ou Date
}

interface AgentCardProps {
  agent: Agent;
}

const getStatusVariant = (status: Agent["status"]): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Opérationnel":
      return "default"; // Vert (primaire dans votre thème)
    case "En Test":
      return "secondary"; // Une autre couleur pour indiquer le test
    case "Optimisation":
      return "outline"; // Peut-être un contour pour indiquer un processus
    case "Inactif":
      return "destructive"; // Rouge pour inactif ou problème
    default:
      return "outline";
  }
};

const getStatusIcon = (status: Agent["status"]) => {
  switch (status) {
    case "Opérationnel":
      return <CheckCircleIcon className="w-4 h-4 mr-1" />;
    case "En Test":
      return <ActivityIcon className="w-4 h-4 mr-1" />;
    case "Optimisation":
      return <ClockIcon className="w-4 h-4 mr-1" />;
    case "Inactif":
      return <AlertTriangleIcon className="w-4 h-4 mr-1" />;
    default:
      return null;
  }
}

const formatPercentage = (value: number | null) => {
  if (value === null || isNaN(value)) return "N/A";
  return `${value.toFixed(2)}%`;
};

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const returnColor = agent.cumulative_return_percentage !== null && agent.cumulative_return_percentage >= 0 ? "text-success" : "text-warning";
  const returnIcon = agent.cumulative_return_percentage !== null && agent.cumulative_return_percentage >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />;

  const weeklyReturnColor = agent.weekly_return_percentage !== null && agent.weekly_return_percentage >= 0 ? "text-success" : "text-warning";
  const weeklyReturnIcon = agent.weekly_return_percentage !== null && agent.weekly_return_percentage >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />;


  return (
    <Card className="glass-card animate-fade-in flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{agent.agent_name}</CardTitle>
            <CardDescription className="text-sm">
              {agent.currency_pair} - {agent.timeframe}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(agent.status)} className="flex items-center">
            {getStatusIcon(agent.status)}
            {agent.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Performance</h4>
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">Cumulée:</p>
            <span className={`text-lg font-semibold flex items-center gap-1 ${returnColor}`}>
              {returnIcon}
              {formatPercentage(agent.cumulative_return_percentage)}
            </span>
          </div>
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">Hebdomadaire:</p>
            <span className={`text-md font-semibold flex items-center gap-1 ${weeklyReturnColor}`}>
              {weeklyReturnIcon}
              {formatPercentage(agent.weekly_return_percentage)}
            </span>
          </div>
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">Taux de réussite:</p>
            <p className="text-md font-semibold">{formatPercentage(agent.win_rate_percentage)}</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Risque</h4>
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">Drawdown Max:</p>
            <p className="text-md font-semibold text-warning flex items-center gap-1">
              <TrendingDownIcon className="w-3 h-3" />
              {formatPercentage(agent.max_drawdown_percentage)}
            </p>
          </div>
           <div className="mb-2">
            <p className="text-xs text-muted-foreground">Drawdown Actuel:</p>
            <p className="text-md font-semibold text-warning">
              {formatPercentage(agent.current_drawdown_percentage)}
            </p>
          </div>
        </div>
        {agent.equity_curve_data && agent.equity_curve_data.length > 0 && (
          <div className="md:col-span-2 h-[150px] mt-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Courbe de Capital</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={agent.equity_curve_data}>
                <XAxis 
                  dataKey="date" 
                  stroke="#E6E4DD"
                  fontSize={10}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  stroke="#E6E4DD"
                  fontSize={10}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `${value.toFixed(0)}`} // Ajustez le formatage si nécessaire
                  allowDataOverflow={true}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#3A3935', // Correspond à secondary.DEFAULT
                    border: '1px solid #605F5B', // Correspond à muted.DEFAULT
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#E6E4DD' }} // muted.foreground
                  itemStyle={{ color: '#8989DE' }} // primary.DEFAULT
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8989DE" // primary.DEFAULT
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <div className="px-6 pb-4 mt-auto">
        <p className="text-xs text-muted-foreground text-right">
          Dernière MàJ: {new Date(agent.last_updated).toLocaleString('fr-FR')}
        </p>
      </div>
    </Card>
  );
};

export default AgentCard;
