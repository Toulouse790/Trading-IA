
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrainingLog } from "@/hooks/useTrainingLogs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TrainingLogsListProps {
  trainings: TrainingLog[];
}

export default function TrainingLogsList({ trainings }: TrainingLogsListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Historique des Entraînements</h2>
      <div className="grid gap-4">
        {trainings.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">Aucun entraînement trouvé</p>
            </CardContent>
          </Card>
        ) : (
          trainings.map((training) => (
            <Card key={training.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {training.best_pattern_name || 'Pattern inconnu'}
                  </CardTitle>
                  <Badge variant={training.win_rate > 50 ? "default" : "destructive"}>
                    {training.win_rate.toFixed(1)}% Win Rate
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {training.training_date 
                    ? format(new Date(training.training_date), "PPpp", { locale: fr })
                    : 'Date inconnue'
                  }
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Trades analysés:</span>
                    <p>{training.total_trades_analyzed}</p>
                  </div>
                  <div>
                    <span className="font-medium">Sharpe Ratio:</span>
                    <p>{training.sharpe_ratio.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Profit:</span>
                    <p className={training.best_pattern_profit > 0 ? "text-green-600" : "text-red-600"}>
                      {training.best_pattern_profit.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Assistant:</span>
                    <p>{training.assistant_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
