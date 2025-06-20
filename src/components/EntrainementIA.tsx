
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Settings, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface AgentStatus {
  id: string;
  agent_name: string;
  status: string;
  last_updated: string;
}

const fetchAgentStatus = async (): Promise<AgentStatus | null> => {
  const { data, error } = await supabase
    .from('agents')
    .select('id, agent_name, status, updated_at')
    .eq('status', 'Actif')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.warn("Aucun agent actif trouvé ou erreur:", error);
    return null;
  }

  return {
    id: data.id,
    agent_name: data.agent_name,
    status: data.status,
    last_updated: data.updated_at
  };
};

export default function EntrainementIA() {
  const [isStarting, setIsStarting] = useState(false);

  const { data: agentStatus, isLoading, error, refetch } = useQuery({
    queryKey: ['agentStatus'],
    queryFn: fetchAgentStatus,
    refetchInterval: 30000, // Rafraîchit toutes les 30 secondes
  });

  const handleStart = async () => {
    setIsStarting(true);
    try {
      // Ici on pourrait déclencher l'entraînement via une edge function
      // Pour l'instant, on simule juste le démarrage
      console.log("Démarrage de l'entraînement pour l'agent:", agentStatus?.agent_name);
      
      // Rafraîchir le statut après tentative de démarrage
      setTimeout(() => {
        refetch();
        setIsStarting(false);
      }, 2000);
    } catch (error) {
      console.error("Erreur lors du démarrage:", error);
      setIsStarting(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Actif':
        return 'default';
      case 'En apprentissage':
        return 'secondary';
      case 'Inactif':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif':
        return 'text-green-600';
      case 'En apprentissage':
        return 'text-blue-600';
      case 'Inactif':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            Entraînement IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-6 pt-0">
          <div className="text-sm text-muted-foreground">Chargement du statut de l'agent...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          Entraînement IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-3 sm:p-6 pt-0">
        {!agentStatus ? (
          <div className="flex items-center gap-2 p-3 bg-destructive/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Aucun agent actif détecté</p>
              <p className="text-xs text-destructive/80">Vérifiez la configuration de vos agents</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Agent: {agentStatus.agent_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getStatusVariant(agentStatus.status)} className="mt-1">
                    {agentStatus.status}
                  </Badge>
                  {agentStatus.status === 'Inactif' && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleStart} 
                  disabled={isStarting || agentStatus.status === 'En apprentissage'}
                  size="sm"
                  className="flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                  {isStarting ? "Démarrage..." : "Démarrer"}
                </Button>
                <Button 
                  disabled={agentStatus.status !== 'En apprentissage'}
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
                <span>Dernière mise à jour</span>
                <span className="text-muted-foreground">
                  {new Date(agentStatus.last_updated).toLocaleString('fr-FR')}
                </span>
              </div>
              {agentStatus.status === 'Inactif' && (
                <div className="p-2 bg-destructive/10 rounded text-xs text-destructive">
                  ⚠️ L'agent est à l'arrêt - vérifiez la configuration ou les logs d'erreur
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
