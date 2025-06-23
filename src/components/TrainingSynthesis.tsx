
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrainingLog } from "@/hooks/useTrainingLogs";
import { TrendingUp, TrendingDown, Target, Brain } from "lucide-react";

type Props = {
  trainings: TrainingLog[];
};

export default function TrainingSynthesis({ trainings }: Props) {
  if (!trainings || trainings.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">📊 Résumé de l'Entraînement</h2>
        <div className="text-center text-muted-foreground py-8">
          ⏳ Aucune donnée d'entraînement disponible
        </div>
      </div>
    );
  }

  const latestTraining = trainings[0];
  const avgWinRate = trainings.reduce((sum, t) => sum + (t.win_rate || 0), 0) / trainings.length;
  const avgSharpe = trainings.reduce((sum, t) => sum + (t.sharpe_ratio || 0), 0) / trainings.length;
  const bestRuns = trainings.filter(t => t.is_best_run || (t.win_rate || 0) >= 70);
  const failedRuns = trainings.filter(t => (t.win_rate || 0) < 50);

  // Obtenir les patterns les plus fréquents
  const patternCounts = trainings.reduce((acc, t) => {
    if (t.best_pattern_name) {
      acc[t.best_pattern_name] = (acc[t.best_pattern_name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topPatterns = Object.entries(patternCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([pattern]) => pattern);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {/* Executive Summary Card */}
      <Card className="lg:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Résumé Exécutif IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Analyse de {trainings.length} sessions d'entraînement. 
            Taux de réussite moyen: <span className="font-semibold text-primary">{avgWinRate.toFixed(1)}%</span>.
            Ratio de Sharpe moyen: <span className="font-semibold text-primary">{avgSharpe.toFixed(2)}</span>.
            {bestRuns.length > 0 && ` ${bestRuns.length} sessions exceptionnelles identifiées.`}
          </p>
        </CardContent>
      </Card>

      {/* Patterns Gagnants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Patterns Gagnants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPatterns.length > 0 ? (
              topPatterns.map((pattern, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{pattern}</span>
                  <Badge variant="secondary" className="text-xs">
                    {patternCounts[pattern]}x
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aucun pattern identifié</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Causes des Pertes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-4 w-4 text-red-500" />
            Analyses des Échecs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sessions échouées</span>
              <Badge variant="destructive" className="text-xs">
                {failedRuns.length}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taux d'échec</span>
              <span className="text-muted-foreground">
                {((failedRuns.length / trainings.length) * 100).toFixed(1)}%
              </span>
            </div>
            {failedRuns.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Principales causes: Win rate insuffisant, erreurs de stratégie
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Niveau Actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-4 w-4 text-blue-500" />
            Niveau Actuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Badge variant="outline" className="mb-2">
                {latestTraining?.training_level || "Débutant"}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Dernier entraînement: {latestTraining?.win_rate?.toFixed(1)}% win rate
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Assistant: {latestTraining?.assistant_id || "Non défini"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Recommandées */}
      <Card className="lg:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Actions Recommandées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Optimisations Prioritaires</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Analyser les patterns les plus performants</li>
                <li>• Optimiser les paramètres de risque</li>
                <li>• Augmenter la diversification des stratégies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Apprentissage Continu</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Analyser les données de marché récentes</li>
                <li>• Ajuster les modèles selon les conditions</li>
                <li>• Valider les stratégies sur données historiques</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
