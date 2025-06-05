
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrainingLog } from "@/hooks/useTrainingLogs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertCircle } from "lucide-react";

interface ErreursRatesProps {
  trainings: TrainingLog[];
}

export default function ErreursRates({ trainings }: ErreursRatesProps) {
  const failedRuns = trainings
    .filter(t => t.win_rate < 60 || t.status === "error")
    .slice(0, 5);

  const errorRate = trainings.length > 0 
    ? (failedRuns.length / trainings.length * 100).toFixed(1)
    : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Erreurs / Ratés
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">Taux d'échec</span>
          <Badge variant={parseFloat(errorRate) > 30 ? "destructive" : "secondary"}>
            {errorRate}%
          </Badge>
        </div>

        {failedRuns.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Aucun échec récent
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {failedRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
                    {run.training_date 
                      ? format(new Date(run.training_date), "dd/MM", { locale: fr })
                      : "N/A"
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">
                      {run.win_rate?.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {run.status || "Échec"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-20 truncate">
                    {run.notes || "Aucune note"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
