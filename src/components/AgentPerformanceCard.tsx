
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Agent } from "@/types/agent";

export default function AgentPerformanceCard({ agent }: { agent: Agent }) {
  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "Actif":
        return "text-green-600";
      case "Inactif":
        return "text-red-600";
      case "En pause":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{agent.agent_name}</h3>
            <p className="text-sm text-muted-foreground">
              {agent.currency_pair} • {agent.timeframe}
            </p>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(agent.status)}`}>
            {agent.status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Retour Semaine</p>
            <p className="text-lg font-bold">
              {agent.weekly_return_percentage?.toFixed(2) || "0.00"}%
            </p>
            <p className="text-sm text-muted-foreground">Taux de Réussite</p>
            <p className="text-md font-semibold">
              {agent.win_rate_percentage?.toFixed(1) || "0.0"}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Retour Cumulé</p>
            <p className="text-md font-semibold">
              {agent.cumulative_return_percentage?.toFixed(2) || "0.00"}%
            </p>
            <p className="text-sm text-muted-foreground">Drawdown Max</p>
            <p className="text-md font-semibold">
              {agent.max_drawdown_percentage?.toFixed(2) || "0.00"}%
            </p>
          </div>
        </div>
        
        {agent.equity_curve_data && agent.equity_curve_data.length > 0 && (
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={agent.equity_curve_data}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
