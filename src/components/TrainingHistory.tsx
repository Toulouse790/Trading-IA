
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpenIcon } from 'lucide-react';
import { useTrainingLogs } from '@/hooks/useTrainingLogs';
import { useSafeData } from '@/hooks/useSafeData';
import ErrorBoundary from './ErrorBoundary';

interface TrainingLog {
  id: string;
  training_date: string;
  win_rate: number;
  sharpe_ratio: number;
  best_pattern_name: string;
  status: string;
}

function TrainingHistoryContent() {
  const { data: logs, isLoading, error } = useTrainingLogs();
  const { getSafeArray } = useSafeData();

  // Sécuriser les données et fournir des fallbacks
  const safeTrainingLogs = getSafeArray<TrainingLog>(logs, []);

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <BookOpenIcon className="h-5 w-5" />
            Historique d'entraînement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <BookOpenIcon className="h-5 w-5" />
            Erreur - Historique d'entraînement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 dark:text-red-300 text-sm">
            Impossible de charger l'historique d'entraînement.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <BookOpenIcon className="h-5 w-5" />
          Historique d'entraînement ({safeTrainingLogs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {safeTrainingLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>Aucun entraînement disponible pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {safeTrainingLogs.map((log, index) => (
              <div
                key={log.id || index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {log.training_date || 'Date inconnue'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {log.best_pattern_name || 'Pattern inconnu'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {(log.win_rate || 0).toFixed(1)}%
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Sharpe: {(log.sharpe_ratio || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TrainingHistory() {
  return (
    <ErrorBoundary>
      <TrainingHistoryContent />
    </ErrorBoundary>
  );
}
