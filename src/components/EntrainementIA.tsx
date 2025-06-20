
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function EntrainementIA() {
  const [agent, setAgent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchAgentStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de l\'agent:', error);
        return;
      }

      setAgent(data);
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  const handleStart = async () => {
    if (!agent) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({ 
          status: 'Actif',
          updated_at: new Date().toISOString()
        })
        .eq('id', agent.id);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        toast({
          title: "Erreur",
          description: "Impossible de démarrer l'agent",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Agent démarré",
        description: "L'agent de trading est maintenant actif",
      });

      // Mettre à jour l'état local immédiatement
      setAgent(prev => prev ? { ...prev, status: 'Actif' } : null);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast({
        title: "Erreur de connexion",
        description: "Problème de communication avec la base de données",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (!agent) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({ 
          status: 'Inactif',
          updated_at: new Date().toISOString()
        })
        .eq('id', agent.id);

      if (error) {
        console.error('Erreur lors de l\'arrêt:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'arrêter l'agent",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Agent arrêté",
        description: "L'agent de trading a été arrêté",
      });

      // Mettre à jour l'état local immédiatement
      setAgent(prev => prev ? { ...prev, status: 'Inactif' } : null);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast({
        title: "Erreur de connexion",
        description: "Problème de communication avec la base de données",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentStatus();

    // Surveiller les changements en temps réel
    const channel = supabase
      .channel('agents-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'agents' }, 
        () => {
          fetchAgentStatus();
        }
      )
      .subscribe();

    // Vérifier la connexion toutes les 30 secondes
    const interval = setInterval(fetchAgentStatus, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'actif':
        return 'bg-green-500 text-white';
      case 'inactif':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const isRunning = agent?.status?.toLowerCase() === 'actif';

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
            <p className="text-xs sm:text-sm text-muted-foreground">
              Agent: {agent?.agent_name || 'Aucun agent'}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Statut</p>
            <Badge className={`mt-1 ${getStatusColor(agent?.status)}`}>
              {agent?.status || 'Inconnu'}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleStart} 
              disabled={isRunning || isLoading || !agent}
              size="sm"
              className="flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              {isLoading ? 'Chargement...' : 'Démarrer'}
            </Button>
            <Button 
              onClick={handleStop} 
              disabled={!isRunning || isLoading || !agent}
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
          {agent && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Dernière mise à jour</span>
              <span className="text-muted-foreground">
                {agent.updated_at ? new Date(agent.updated_at).toLocaleTimeString('fr-FR') : 'Inconnue'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
