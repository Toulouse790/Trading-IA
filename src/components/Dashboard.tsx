import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTrainingLogs } from "@/hooks/useTrainingLogs";
import TrainingLogsList from "@/components/TrainingLogsList";
import TrainingSynthesis from "@/components/TrainingSynthesis";
import EntrainementIA from "@/components/EntrainementIA";
import BestRuns from "@/components/BestRuns";
import ProgressionHebdo from "@/components/ProgressionHebdo";
import ErreursRates from "@/components/ErreursRates";
import ConfigurationAgent from "@/components/ConfigurationAgent";
import { AlertCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import ConnectionDiagnostic from "@/components/ConnectionDiagnostic";

export default function Dashboard() {
  const { data: trainings, isLoading, error } = useTrainingLogs();

  if (isLoading) {
    return (
      <div className="p-2 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Dashboard IA Trading</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Dashboard IA Trading</h1>
        <Card className="bg-destructive/20 border-destructive">
          <CardContent className="p-4 sm:p-6 flex items-start sm:items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-destructive-foreground text-sm sm:text-base">
              Erreur lors du chargement des données: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard IA Trading</h1>
        <Link to="/assistants">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Gérer les Assistants</span>
            <span className="sm:hidden">Assistants</span>
          </Button>
        </Link>
      </div>
      
      {/* Ajout du diagnostic de connexion */}
      <ConnectionDiagnostic />
      
      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="trainings" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Historique</TabsTrigger>
          <TabsTrigger value="components" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Composants IA</TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Analyse</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <TrainingSynthesis trainings={trainings || []} />
        </TabsContent>
        
        <TabsContent value="trainings">
          <TrainingLogsList trainings={trainings || []} />
        </TabsContent>

        <TabsContent value="components" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <EntrainementIA />
            <ConfigurationAgent trainings={trainings || []} />
            <BestRuns trainings={trainings || []} />
            <ErreursRates trainings={trainings || []} />
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4 sm:space-y-6">
          <ProgressionHebdo />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <BestRuns trainings={trainings || []} />
            <ErreursRates trainings={trainings || []} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
