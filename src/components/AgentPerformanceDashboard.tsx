// src/components/AgentPerformanceDashboard.tsx
import { useQuery } from "@tanstack/react-query";
import AgentCard, { Agent, EquityDataPoint } from "./AgentCard"; // Assurez-vous que le chemin est correct
import { Skeleton } from "@/components/ui/skeleton"; //
import { Card, CardHeader, CardContent } from "@/components/ui/card"; //
import { supabase } from "@/integrations/supabase/client"; // Correction de l'import

// L'interface Agent doit correspondre aux colonnes de votre table agent_metrics
// et à ce que AgentCard attend.

const fetchAgentPerformanceData = async (): Promise<Agent[]> => {
  // Interroger la table 'agent_metrics' que vous avez créée
  const { data: agentMetricsData, error } = await supabase
    .from('agent_metrics') // Nom de la table créée avec le SQL
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
    .order('agent_name', { ascending: true });

  if (error) {
    console.error("Erreur Supabase lors de la récupération des métriques agents:", error);
    // Il est préférable de lancer l'erreur pour que React Query la gère
    // et affiche le composant d'erreur dans l'UI.
    throw new Error(error.message || "Impossible de récupérer les performances des agents.");
  }

  if (!agentMetricsData) {
    return []; // Retourner un tableau vide si aucune donnée n'est trouvée
  }

  // Transformer les données de la table agent_metrics en format Agent
  const agents: Agent[] = agentMetricsData.map(item => {
    // Assurez-vous que les noms de propriétés ici correspondent aux noms de colonnes
    // de votre table 'agent_metrics' et aux propriétés de l'interface 'Agent'.
    return {
      id: item.id || `fallback-id-${Math.random()}`, // L'ID devrait toujours être présent
      agent_name: item.agent_name || "Agent Inconnu",
      currency_pair: item.currency_pair || "N/A",
      timeframe: item.timeframe || "N/A",
      weekly_return_percentage: item.weekly_return_percentage, // Devrait être un nombre ou null
      cumulative_return_percentage: item.cumulative_return_percentage, // Devrait être un nombre ou null
      max_drawdown_percentage: item.max_drawdown_percentage, // Devrait être un nombre ou null
      current_drawdown_percentage: item.current_drawdown_percentage, // Devrait être un nombre ou null
      win_rate_percentage: item.win_rate_percentage, // Devrait être un nombre ou null
      status: (item.status || "Inactif") as Agent["status"], // Assurer la conformité avec le type
      equity_curve_data: (item.equity_curve_data || []) as EquityDataPoint[], // S'assurer que c'est un tableau
      last_updated: item.last_updated || new Date().toISOString(),
    };
  });

  return agents;
};

const AgentPerformanceDashboard = () => {
  const { data: agents, isLoading, error } = useQuery<Agent[], Error>({
    queryKey: ['agentPerformanceMetrics'], // Changé la clé pour éviter les conflits si l'ancienne est cachée
    queryFn: fetchAgentPerformanceData,
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });

  if (isLoading) {
    return (
      <div className="mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">Performances des Agents IA</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card"> {/* */}
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" /> {/* */}
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                   <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-6 w-20 mb-2" />
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <Skeleton className="h-[100px] w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in bg-destructive/20 border-destructive"> {/* */}
        <h2 className="text-2xl font-bold mb-2 text-destructive-foreground">Erreur de chargement des performances</h2>
        <p className="text-destructive-foreground/80">{error.message}</p>
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
       <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in"> {/* */}
        <h2 className="text-2xl font-bold mb-6">Performances des Agents IA</h2>
        <p className="text-muted-foreground">Aucune donnée de performance d'agent disponible pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="mb-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Performances des Agents IA</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default AgentPerformanceDashboard;
