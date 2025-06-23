import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrainingSummaryProps {
  level: string;
  winRate: number;
  summary: string;
  improvements: string[];
  filters: string[];
  actions: string[];
  continuousLearning: string;
}

const TrainingSynthesis: React.FC<TrainingSummaryProps> = ({
  level,
  winRate,
  summary,
  improvements,
  filters,
  actions,
  continuousLearning,
}) => {
  return (
    <Card className="w-full mb-4">
      <CardContent className="space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">📊 Synthèse d'entraînement IA</h2>
          <Badge variant="outline" className="text-sm uppercase">
            Niveau : {level}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground italic">
          Taux de réussite observé : {winRate}%
        </p>

        <p className="text-base">🧠 <strong>Résumé :</strong> {summary}</p>

        <div>
          <h3 className="font-semibold">🔧 Améliorations proposées :</h3>
          <ul className="list-disc list-inside">
            {improvements.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">🛡️ Règles de filtrage :</h3>
          <ul className="list-disc list-inside">
            {filters.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">📌 Actions recommandées :</h3>
          <ul className="list-disc list-inside">
            {actions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <p className="text-sm mt-4">📚 <strong>Formation continue :</strong> {continuousLearning}</p>
      </CardContent>
    </Card>
  );
};

export default TrainingSynthesis;
