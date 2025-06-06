
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrainingLog } from "@/hooks/useTrainingLogs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface SimpleDashboardProps {
  logs: TrainingLog[];
}

export default function SimpleDashboard({ logs }: SimpleDashboardProps) {
  if (!logs || logs.length === 0) return <p className="text-center p-4">Aucun log trouvé.</p>;

  const last = logs[0];
  const formattedDate = last.training_date ? 
    format(new Date(last.training_date), "dd/MM/yyyy HH:mm", { locale: fr }) : 
    "N/A";

  return (
    <div className="space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Dernière session d'apprentissage</CardTitle>
          <p className="text-sm text-muted-foreground">🔁 Date: {formattedDate}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">📈 Win Rate</div>
              <div className="text-2xl font-bold">{last.win_rate?.toFixed(2) || 0}%</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">📊 Sharpe Ratio</div>
              <div className="text-2xl font-bold">{last.sharpe_ratio?.toFixed(2) || "N/A"}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">💡 Meilleur pattern</div>
              <div>{last.best_pattern_name || "N/A"} ({last.best_pattern_profit?.toFixed(2) || 0}%)</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">📉 Pire pattern</div>
              <div>{last.worst_pattern_name || "N/A"} ({last.worst_pattern_loss?.toFixed(2) || 0}%)</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">⏱ Durée entraînement</div>
              <div>{last.training_duration_ms?.toLocaleString() || "N/A"} ms</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">📦 Patterns analysés</div>
              <div>{last.patterns_analyzed?.toLocaleString() || 0}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">📚 Patterns rentables</div>
              <div>{last.profitable_patterns?.toLocaleString() || 0}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">📚 Niveau actuel</div>
              <div>{last.training_level || "LEARNING"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Top Patterns détectés</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {last.top_patterns && Array.isArray(last.top_patterns) && last.top_patterns.length > 0 ? 
              last.top_patterns.map((p: any, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-lg">🔍</span>
                  <span>{p.name} – {p.avgProfit} de profit ({p.occurrences || "N/A"} fois)</span>
                </li>
              )) : 
              <li>Pas de patterns disponibles</li>
            }
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Conditions de marché idéales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {last.market_conditions ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground">🕒 Sessions:</p>
                <p>{last.market_conditions.best_trading_times?.london_open || "N/A"}, 
                  {last.market_conditions.best_trading_times?.ny_overlap || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">📊 Volatilité:</p>
                <p>{last.market_conditions.volatility_filters?.optimal_range || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">🚨 News:</p>
                <p>{last.market_conditions.economic_calendar?.high_impact || "N/A"}</p>
              </div>
            </>
          ) : (
            <p>Données de marché non disponibles</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-t-4 border-primary">
        <CardContent className="pt-6">
          <h3 className="font-bold mb-2">Objectif: atteindre 70% de win rate pour obtenir 6–8% de rendement hebdomadaire.</h3>
          
          <div className="mt-4">
            <p className="mb-2">
              <span className="font-semibold">Niveau actuel: </span>
              <Badge variant="outline">{last.training_level || "LEARNING"}</Badge>
            </p>
            
            {last.win_rate >= 65 ? (
              <p className="text-primary flex items-center gap-2">
                <span>🔥</span> Tu peux passer à l'évaluation réelle si ce niveau est stable.
              </p>
            ) : (
              <p className="text-muted-foreground flex items-center gap-2">
                <span>🧠</span> Continue l'apprentissage pour affiner les décisions.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
