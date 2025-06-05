
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrainingLog } from "@/hooks/useTrainingLogs";
import { Settings } from "lucide-react";

interface ConfigurationAgentProps {
  trainings: TrainingLog[];
}

export default function ConfigurationAgent({ trainings }: ConfigurationAgentProps) {
  const latestTraining = trainings[0];

  const uniqueAssistants = [...new Set(trainings.map(t => t.assistant_id).filter(Boolean))];
  const uniqueStrategies = [...new Set(trainings.map(t => t.strategy_version).filter(Boolean))];
  const uniqueModels = [...new Set(trainings.map(t => t.model_version).filter(Boolean))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuration Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Assistant Actuel</p>
            <Badge variant="outline">
              {latestTraining?.assistant_id || "Non défini"}
            </Badge>
          </div>
          
          <div>
            <p className="text-sm font-medium">Modèle IA</p>
            <Badge variant="outline">
              {latestTraining?.model_version || "gpt-4-turbo"}
            </Badge>
          </div>
          
          <div>
            <p className="text-sm font-medium">Stratégie</p>
            <Badge variant="outline">
              {latestTraining?.strategy_version || "MWD v2.0"}
            </Badge>
          </div>
        </div>

        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Assistants utilisés</span>
            <span className="text-muted-foreground">{uniqueAssistants.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Stratégies testées</span>
            <span className="text-muted-foreground">{uniqueStrategies.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Modèles IA</span>
            <span className="text-muted-foreground">{uniqueModels.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
