
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrainingLog } from "@/hooks/useTrainingLogs";

interface SimpleDashboardProps {
  logs: TrainingLog[];
}

export default function SimpleDashboard({ logs }: SimpleDashboardProps) {
  if (!logs || logs.length === 0) return <p className="text-center p-4">Aucun log trouvé.</p>;

  const last = logs[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <h2 className="font-semibold">🎯 Win Rate</h2>
            <p className="text-2xl">{last.win_rate}%</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <h2 className="font-semibold">🔥 Best Pattern</h2>
            <p>{last.best_pattern_name || 'N/A'} ({last.best_pattern_profit || 'N/A'}%)</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <h2 className="font-semibold">📈 Sharpe Ratio</h2>
            <p>{last.sharpe_ratio || 'N/A'}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <h2 className="font-semibold">⏱ Training Time</h2>
            <p>{last.training_duration_ms || 'N/A'} ms</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Top Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside">
            {last.top_patterns && Array.isArray(last.top_patterns) && last.top_patterns.length > 0 ? 
              last.top_patterns.map((p: any, i: number) => (
                <li key={i}>{p.name} - {p.avgProfit} avg profit</li>
              )) : 
              <li>Pas de patterns disponibles</li>
            }
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
