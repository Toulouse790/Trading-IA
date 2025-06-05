
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
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Award className="h-4 w-4 sm:h-5 sm:w-5" />
          Best Runs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        {bestRuns.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base">
            Aucun best run trouvé
          </p>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm min-w-[60px]">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[80px]">Win Rate</TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[100px] hidden sm:table-cell">Pattern</TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[70px]">Sharpe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="p-2 sm:p-4 text-xs sm:text-sm">
                      {run.training_date 
                        ? format(new Date(run.training_date), "dd/MM", { locale: fr })
                        : "N/A"
                      }
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <Badge variant="default" className="bg-green-500 text-xs">
                        {run.win_rate?.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4 text-xs max-w-[120px] truncate hidden sm:table-cell">
                      {run.best_pattern_name || "N/A"}
                    </TableCell>
                    <TableCell className="p-2 sm:p-4 text-xs sm:text-sm">
                      {run.sharpe_ratio?.toFixed(2) || "N/A"}
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
