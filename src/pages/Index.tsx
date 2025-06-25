
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLatestTrainingLog } from "@/hooks/useTrainingLogs";
import { useSafeData } from "@/hooks/useSafeData";
import ErrorBoundary from "@/components/ErrorBoundary";
import { TrendingUpIcon, BarChart3Icon, BrainIcon } from "lucide-react";

const Index = () => {
  const { data: latestTraining, isLoading } = useLatestTrainingLog();
  const { getSafeData, getSafeNumber, getSafeString } = useSafeData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Tableau de Bord IA Trading
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Suivi des performances des agents de trading IA
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">
              Dashboard Détaillé
            </Button>
          </Link>
        </header>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Aperçu des Performances
          </h2>
          
          <ErrorBoundary>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Agents Actifs
                  </CardTitle>
                  <BrainIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">3</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    En cours d'entraînement
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Performance Moyenne
                  </CardTitle>
                  <TrendingUpIcon className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {isLoading ? '...' : `${getSafeNumber(latestTraining?.win_rate, 74.8).toFixed(1)}%`}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Taux de réussite moyen
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Sharpe Ratio
                  </CardTitle>
                  <BarChart3Icon className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {isLoading ? '...' : getSafeNumber(latestTraining?.sharpe_ratio, 1.44).toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Ratio rendement/risque
                  </p>
                </CardContent>
              </Card>
            </div>
          </ErrorBoundary>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ErrorBoundary>
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Dernier Entraînement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                ) : latestTraining ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Pattern dominant
                      </span>
                      <Badge variant="secondary">
                        {getSafeString(latestTraining.best_pattern_name, 'EMA Rebound')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Taux de réussite
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {getSafeNumber(latestTraining.win_rate, 74.8).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    Aucune donnée d'entraînement disponible
                  </p>
                )}
              </CardContent>
            </Card>
          </ErrorBoundary>
          
          <ErrorBoundary>
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Statut Système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      État du trading
                    </span>
                    <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Actif
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Positions ouvertes
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      2
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Session de marché
                    </span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      London
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Index;
