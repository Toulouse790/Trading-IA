
// src/pages/Index.tsx
import MarketStats from "@/components/MarketStats";
import CryptoChart from "@/components/CryptoChart";
import PortfolioCard from "@/components/PortfolioCard";
import CryptoList from "@/components/CryptoList";
import TrainingResultsDashboard from "@/components/TrainingResultsDashboard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de Bord IA Trading</h1>
            <p className="text-muted-foreground">Suivi des marchés et performances des agents</p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">
              Dashboard Détaillé
            </Button>
          </Link>
        </header>
        
        <MarketStats /> 

        {/* Remplacé par TrainingResultsDashboard */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6">Résultats d'Entraînement</h2>
          <TrainingResultsDashboard data={{}} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <CryptoChart />
          </div>
          <div>
            <PortfolioCard />
          </div>
        </div>
        
        <CryptoList />
      </div>
    </div>;
};
export default Index;
