
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
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          Entraînement IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-3 sm:p-6 pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Statut</p>
            <Badge variant={isRunning ? "default" : "secondary"} className="mt-1">
              {isRunning ? "En cours..." : "Arrêté"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleStart} 
              disabled={isRunning}
              size="sm"
              className="flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              Démarrer
            </Button>
            <Button 
              onClick={handleStop} 
              disabled={!isRunning}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <Square className="h-3 w-3 sm:h-4 sm:w-4" />
              Arrêter
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Mode auto</span>
            <Badge variant="outline" className="text-xs">Activé</Badge>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Prochaine session</span>
            <span className="text-muted-foreground">Dans 2h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
