import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Agent, EquityDataPoint } from "@/types/agent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EquityChart from "@/components/EquityChart"; // Pour afficher la courbe d'équité détaillée
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Fonction utilitaire pour valider et transformer les données equity_curve_data (dupliquée pour l'instant)
const parseEquityCurveData = (data: any): EquityDataPoint[] => {
  if (!data) return [];
  
  try {
    if (Array.isArray(data)) {
      return data.filter(item => 
        item && 
        typeof item === 'object' && 
        'date' in item && 
        'value' in item &&
        typeof item.value === 'number'
      ).map(item => ({
        date: String(item.date),
        value: Number(item.value)
      }));
    }
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parseEquityCurveData(parsed);
      }
    }
    return [];
  } catch (error) {
    console.warn("Erreur lors du parsing des données equity_curve_data dans AgentDetailsPage:", error);
    return [];
  }
};

export default function AgentDetailsPage() {
  const { agentId } = useParams<{ agentId: string }>(); // Récupère l'ID de l'agent depuis l'URL

  const { data: agent, isLoading, error } = useQuery<Agent | null, Error>({
    queryKey: ['agentDetails', agentId],
    queryFn: async () => {
      if (!agentId) return null;
      const { data, error } = await supabase
        .from('agent_metrics')
        .select(`
          id, 
          agent_id,
          agent_name,
          currency_pair,
          timeframe,
          weekly_return_percentage,
          cumulative_return_percentage,
          max_drawdown_percentage,
          current_drawdown_percentage,
          win_rate_percentage,
          status,
          equity_curve_data,
          last_updated
        `)
        .eq('agent_id', agentId) // Filtre par l'agent_id
        .maybeSingle(); // Assure de récupérer un seul enregistrement

      if (error) {
        throw new Error(error.message || "Impossible de récupérer les détails de l'agent.");
      }
      
      if (!data) return null;

      // Transformer les données equity_curve_data
      const equityData = parseEquityCurveData(data.equity_curve_data);

      return {
        ...data,
        equity_curve_data: equityData,
      } as Agent;
    },
    enabled: !!agentId, // La requête ne s'exécute que si agentId est défini
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48 mb-6" /> {/* Titre */}
          <Card className="glass-card">
            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </CardContent>
          </Card>
          <Skeleton className="h-[300px] w-full" /> {/* Graphique */}
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" /> Retour au Dashboard
            </Button>
          </Link>
          <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <CardTitle className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Erreur ou Agent non trouvé
            </CardTitle>
            <p className="text-red-600 dark:text-red-300">
              {error?.message || "Les détails de l'agent n'ont pas pu être chargés ou l'agent n'existe pas."}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "Actif":
        return "text-green-600";
      case "Inactif":
        return "text-red-600";
      case "En pause":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/">
          <Button variant="outline" className="mb-6 bg-background text-foreground hover:bg-muted">
            <ArrowLeftIcon className="h-4 w-4 mr-2" /> Retour au Dashboard
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Détails de l'Agent : {agent.agent_name}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Résumé de l'Agent
                <span className={`text-sm font-medium ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>Paire de devises:</strong> {agent.currency_pair}</p>
              <p><strong>Timeframe:</strong> {agent.timeframe}</p>
              <p><strong>Retour Hebdomadaire:</strong> {agent.weekly_return_percentage?.toFixed(2) || "N/A"}%</p>
              <p><strong>Retour Cumulé:</strong> {agent.cumulative_return_percentage?.toFixed(2) || "N/A"}%</p>
              <p><strong>Win Rate:</strong> {agent.win_rate_percentage?.toFixed(1) || "N/A"}%</p>
              <p><strong>Max Drawdown:</strong> {agent.max_drawdown_percentage?.toFixed(2) || "N/A"}%</p>
              <p><strong>Current Drawdown:</strong> {agent.current_drawdown_percentage?.toFixed(2) || "N/A"}%</p>
              <p><strong>Dernière mise à jour:</strong> {new Date(agent.last_updated).toLocaleString()}</p>
            </CardContent>
          </Card>

          {/* Ici, vous pouvez ajouter d'autres cartes ou composants spécifiques à l'agent,
              comme un historique de trades détaillés pour cet agent, des statistiques
              plus fines, ou même des contrôles si besoin.
              Pour l'instant, je vais laisser un espace pour de futures extensions.
          */}
        </div>

        <ErrorBoundary>
          <EquityChart agentId={agent.agent_id} height={400} />
        </ErrorBoundary>

        {/* Vous pourriez ajouter ici un composant TrainingLogsList filtré par agentId */}
        {/* Exemple : <TrainingLogsList agentId={agent.agent_id} /> */}
      </div>
    </div>
  );
}
