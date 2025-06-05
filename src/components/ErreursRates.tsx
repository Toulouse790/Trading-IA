
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
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          Erreurs / Ratés
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-3 sm:p-6 pt-0">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm">Taux d'échec</span>
          <Badge variant={parseFloat(errorRate) > 30 ? "destructive" : "secondary"} className="text-xs">
            {errorRate}%
          </Badge>
        </div>

        {failedRuns.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 sm:py-8 text-xs sm:text-sm">
            Aucun échec récent
          </p>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs min-w-[60px]">Date</TableHead>
                  <TableHead className="text-xs min-w-[80px]">Win Rate</TableHead>
                  <TableHead className="text-xs min-w-[70px] hidden sm:table-cell">Statut</TableHead>
                  <TableHead className="text-xs min-w-[100px] hidden md:table-cell">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="p-2 text-xs">
                      {run.training_date 
                        ? format(new Date(run.training_date), "dd/MM", { locale: fr })
                        : "N/A"
                      }
                    </TableCell>
                    <TableCell className="p-2">
                      <Badge variant="destructive" className="text-xs">
                        {run.win_rate?.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="p-2 hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {run.status || "Échec"}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-2 text-xs text-muted-foreground max-w-20 truncate hidden md:table-cell">
                      {run.notes || "Aucune note"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
