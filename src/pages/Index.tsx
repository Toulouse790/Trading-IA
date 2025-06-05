
import MarketStats from "@/components/MarketStats";
import PortfolioCard from "@/components/PortfolioCard";
import TrainingResultsDashboard from "@/components/TrainingResultsDashboard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLatestTrainingLog } from "@/hooks/useTrainingLogs";

const Index = () => {
  const { data: latestTraining } = useLatestTrainingLog();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de Bord IA Trading</h1>
            <p className="text-muted-foreground">Suivi des performances des agents de trading IA</p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">
              Dashboard Détaillé
            </Button>
          </Link>
        </header>
        
        <MarketStats /> 

        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6">Derniers Résultats d'Entraînement</h2>
          <TrainingResultsDashboard data={latestTraining} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <PortfolioCard />
          </div>
          <div>
            {/* Espace pour futurs composants de trading IA */}
            <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/25">
              <p className="text-muted-foreground">Futures métriques IA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
