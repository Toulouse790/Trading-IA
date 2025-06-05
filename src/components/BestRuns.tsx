
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrainingLog } from "@/hooks/useTrainingLogs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Award } from "lucide-react";

interface BestRunsProps {
  trainings: TrainingLog[];
}

export default function BestRuns({ trainings }: BestRunsProps) {
  const bestRuns = trainings
    .filter(t => t.is_best_run || t.win_rate >= 70)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Best Runs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bestRuns.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Aucun best run trouvé
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>Pattern</TableHead>
                <TableHead>Sharpe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bestRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
                    {run.training_date 
                      ? format(new Date(run.training_date), "dd/MM", { locale: fr })
                      : "N/A"
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-500">
                      {run.win_rate?.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {run.best_pattern_name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {run.sharpe_ratio?.toFixed(2) || "N/A"}
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
