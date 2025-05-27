// src/components/AgentPerformanceDashboard.tsx
import { useQuery } from "@tanstack/react-query";
import AgentCard, { Agent, EquityDataPoint } from "./AgentCard"; // Assurez-vous que le chemin est correct
import { Skeleton } from "@/components/ui/skeleton"; //
import { Card, CardHeader, CardContent } from "@/components/ui/card"; // AJOUT DES IMPORTS MANQUANTS

// Remplacez ceci par votre client Supabase et votre logique de fetch
// import { supabase } from '@/lib/supabaseClient'; // Exemple d'importation

const fetchAgentPerformanceData = async (): Promise<Agent[]> => {
  // ======= REMPLACEZ PAR VOTRE LOGIQUE SUPABASE =======
  // Exemple de données mockées en attendant la connexion à Supabase
  // Dans la réalité, vous feriez :
  // const { data, error } = await supabase.from('agent_performance').select('*');
  // if (error) throw new Error(error.message);
  // return data as Agent[];

  // Données de démonstration
  const demoEquityData1: EquityDataPoint[] = [];
  let value1 = 1000;
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    value1 += Math.random() * 20 - 8; // Fluctuation
    demoEquityData1.push({ date: date.toISOString().split('T')[0], value: parseFloat(value1.toFixed(2)) });
  }

  const demoEquityData2: EquityDataPoint[] = [];
  let value2 = 1000;
   for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    value2 += Math.random() * 30 - 15; // Fluctuation plus importante
    demoEquityData2.push({ date: date.toISOString().split('T')[0], value: parseFloat(value2.toFixed(2)) });
  }
  
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve([
        {
          id: "1",
          agent_name: "Agent EUR/USD H1",
          currency_pair: "EUR/USD",
          timeframe: "H1",
          weekly_return_percentage: 1.25,
          cumulative_return_percentage: 5.80,
          max_drawdown_percentage: -2.5,
          current_drawdown_percentage: -0.5,
          win_rate_percentage: 62.5,
          status: "Opérationnel",
          equity_curve_data: demoEquityData1,
          last_updated: new Date().toISOString(),
        },
        {
          id: "2",
          agent_name: "Agent GBP/JPY M30 (Test)",
          currency_pair: "GBP/JPY",
          timeframe: "M30",
          weekly_return_percentage: -0.5,
          cumulative_return_percentage: -1.2,
          max_drawdown_percentage: -3.1,
          current_drawdown_percentage: -1.1,
          win_rate_percentage: 45.0,
          status: "En Test",
          equity_curve_data: demoEquityData2,
          last_updated: new Date(Date.now() - 3600000).toISOString(), // il y a 1 heure
        },
        {
          id: "3",
          agent_name: "Optimiseur IA Stratégies",
          currency_pair: "N/A",
          timeframe: "N/A",
          weekly_return_percentage: null,
          cumulative_return_percentage: null,
          max_drawdown_percentage: null,
          current_drawdown_percentage: null,
          win_rate_percentage: null,
          status: "Optimisation",
          equity_curve_data: null,
          last_updated: new Date(Date.now() - 7200000).toISOString(), // il y a 2 heures
        },
      ]);
    }, 1500)
  );
  // ===============================================
};

const AgentPerformanceDashboard = () => {
  const { data: agents, isLoading, error } = useQuery<Agent[], Error>({
    queryKey: ['agentPerformance'],
    queryFn: fetchAgentPerformanceData,
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });

  if (isLoading) {
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
    return (
      <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in bg-destructive/20 border-destructive">
        <h2 className="text-2xl font-bold mb-2 text-destructive-foreground">Erreur de chargement des performances</h2>
        <p className="text-destructive-foreground/80">{error.message}</p>
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
       <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
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
