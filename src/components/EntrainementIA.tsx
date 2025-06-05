
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Settings } from "lucide-react";

export default function EntrainementIA() {
  const [isRunning, setIsRunning] = useState(false);

  const handleStart = () => {
    setIsRunning(true);
    // Ici on pourrait déclencher l'entraînement via une edge function
    setTimeout(() => setIsRunning(false), 3000); // Simulation
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Entraînement IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Statut</p>
            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? "En cours..." : "Arrêté"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleStart} 
              disabled={isRunning}
              size="sm"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Démarrer
            </Button>
            <Button 
              onClick={handleStop} 
              disabled={!isRunning}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Arrêter
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Mode auto</span>
            <Badge variant="outline">Activé</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Prochaine session</span>
            <span className="text-muted-foreground">Dans 2h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
