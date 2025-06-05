
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrainingLog } from "@/hooks/useTrainingLogs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TrainingLogsListProps {
  trainings: TrainingLog[];
}

export default function TrainingLogsList({ trainings }: TrainingLogsListProps) {
  const [selectedLog, setSelectedLog] = useState<TrainingLog | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des Entraînements</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Assistant</TableHead>
              <TableHead>Win Rate</TableHead>
              <TableHead>Top Pattern</TableHead>
              <TableHead>Stratégie</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainings.map((training) => (
              <TableRow key={training.id}>
                <TableCell>
                  {training.training_date 
                    ? format(new Date(training.training_date), "dd/MM/yyyy HH:mm", { locale: fr })
                    : "N/A"
                  }
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {training.assistant_id || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={training.win_rate >= 60 ? "default" : "secondary"}
                    className={training.win_rate >= 60 ? "bg-green-500" : ""}
                  >
                    {training.win_rate?.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  {training.best_pattern_name || "N/A"}
                </TableCell>
                <TableCell>
                  {training.strategy_version || "N/A"}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedLog(training)}
                      >
                        Voir détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Détails du Training - {training.training_date 
                            ? format(new Date(training.training_date), "dd/MM/yyyy HH:mm", { locale: fr })
                            : "N/A"
                          }
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <strong>Assistant ID:</strong> {training.assistant_id || "N/A"}
                          </div>
                          <div>
                            <strong>Stratégie:</strong> {training.strategy_version || "N/A"}
                          </div>
                          <div>
                            <strong>Win Rate:</strong> {training.win_rate?.toFixed(2)}%
                          </div>
                          <div>
                            <strong>Sharpe Ratio:</strong> {training.sharpe_ratio?.toFixed(2) || "N/A"}
                          </div>
                          <div>
                            <strong>Max Drawdown:</strong> {training.max_consecutive_losses || "N/A"}
                          </div>
                          <div>
                            <strong>RR Moyen:</strong> {training.avg_rr_ratio?.toFixed(2) || "N/A"}
                          </div>
                        </div>
                        <div>
                          <strong>Log JSON complet:</strong>
                          <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                            {JSON.stringify(training, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
