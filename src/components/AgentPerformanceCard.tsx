// src/components/AgentPerformanceDashboard.tsx
import { useQuery } from "@tanstack/react-query";
import AgentPerformanceCard from "./AgentPerformanceCard";
import { Agent, EquityDataPoint } from "@/types/agent"; // Assurez-vous que Agent est importé
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

// Fonction utilitaire pour valider et transformer les données equity_curve_data
const parseEquityCurveData = (data: any): EquityDataPoint[] => {
  if (!data) return [];
  
  try {
    // Si c'est déjà un tableau
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
    
    // Si c'est une string JSON, essayer de la parser
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parseEquityCurveData(parsed);
      }
    }
    
    return [];
  } catch (error) {
    console.warn("Erreur lors du parsing des données equity_curve_data:", error);
    return [];
  }
};

const fetchAgentPerformanceData = async (): Promise<Agent[]> => {
  console.log("🔄 Début de la récupération des données agent_metrics...");
  
  try {
    // Interroger la table 'agent_metrics' avec tous les champs nécessaires
    const { data: agentMetricsData, error } = await supabase
      .from('agent_metrics')
      .select(`
        id, 
        agent_id, // <-- Assurez-vous que agent_id est bien sélectionné
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

    console.log("📊 Données brutes reçues de Supabase:", agentMetricsData);
    console.log("❌ Erreur Supabase (si présente):", error);

    if (error) {
      console.error("❌ Erreur Supabase lors de la récupération des métriques agents:", error);
      throw new Error(error.message || "Impossible de récupérer les performances des agents.");
    }

    if (!agentMetricsData || agentMetricsData.length === 0) {
      console.warn("⚠️ Aucune donnée trouvée dans la table agent_metrics");
      return [];
    }

    console.log(`✅ ${agentMetricsData.length} enregistrement(s) trouvé(s) dans agent_metrics`);

    // Transformer les données de la table agent_metrics en format Agent
    const agents: Agent[] = agentMetricsData.map((item, index) => {
      console.log(`🔄 Transformation de l'agent ${index + 1}:`, item);
      
      // Transformation sécurisée des données equity_curve_data
      const equityData = parseEquityCurveData(item.equity_curve_data);
      console.log(`📈 Données equity curve pour ${item.agent_name}:`, equityData);

      const transformedAgent: Agent = {
        id: item.id || `fallback-id-${Math.random()}`,
        agent_id: item.agent_id || `fallback-agent-id-${Math.random()}`, // <-- NOUVEAU : Mappage de agent_id
        agent_name: item.agent_name || "Agent Inconnu",
        currency_pair: item.currency_pair || "N/A",
        timeframe: item.timeframe || "N/A",
        weekly_return_percentage: item.weekly_return_percentage,
        cumulative_return_percentage: item.cumulative_return_percentage,
        max_drawdown_percentage: item.max_drawdown_percentage,
        current_drawdown_percentage: item.current_drawdown_percentage,
        win_rate_percentage: item.win_rate_percentage,
        status: (item.status || "Inactif") as Agent["status"],
        equity_curve_data: equityData,
        last_updated: item.last_updated || new Date().toISOString(),
      };

      console.log(`✅ Agent transformé ${index + 1}:`, transformedAgent);
      return transformedAgent;
    });

    console.log("🎉 Transformation terminée. Agents finaux:", agents);
    return agents;

  } catch (error) {
    console.error("💥 Erreur générale dans fetchAgentPerformanceData:", error);
    throw error;
  }
};

const AgentPerformanceDashboard = () => {
  console.log("🚀 Rendu de AgentPerformanceDashboard");

  const { data: agents, isLoading, error } = useQuery<Agent[], Error>({
    queryKey: ['agentPerformanceMetrics'],
    queryFn: fetchAgentPerformanceData,
    refetchInterval: 60000, // Rafraîchir toutes les minutes
    retry: 3,
    retryDelay: 1000,
  });

  console.log("📊 État du query:", { agents, isLoading, error });

  if (isLoading) {
    console.log("⏳ Chargement en cours...");
    return (
      <div className="mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">Performances des Agents IA</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
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
    console.error("❌ Erreur affichée à l'utilisateur:", error.message);
    return (
      <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in bg-destructive/20 border-destructive">
        <h2 className="text-2xl font-bold mb-2 text-destructive-foreground">Erreur de chargement des performances</h2>
        <p className="text-destructive-foreground/80">{error.message}</p>
        <p className="text-sm text-destructive-foreground/60 mt-2">
          Vérifiez la console pour plus de détails.
        </p>
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    console.log("⚠️ Aucun agent à afficher");
    return (
       <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">Performances des Agents IA</h2>
        <p className="text-muted-foreground">Aucune donnée de performance d'agent disponible pour le moment.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Assurez-vous que des données sont présentes dans la table 'agent_metrics' de Supabase.
        </p>
      </div>
    )
  }

  console.log(`🎉 Affichage de ${agents.length} agent(s)`);
  return (
    <div className="mb-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Performances des Agents IA</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentPerformanceCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default AgentPerformanceDashboard;
