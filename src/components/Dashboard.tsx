
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainingLogs } from "@/hooks/useTrainingLogs";
import TrainingLogsList from "@/components/TrainingLogsList";
import TrainingSynthesis from "@/components/TrainingSynthesis";
import { AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: trainings, isLoading, error } = useTrainingLogs();

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard IA Trading</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
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
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard IA Trading</h1>
        <Card className="bg-destructive/20 border-destructive">
          <CardContent className="p-6 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive-foreground">
              Erreur lors du chargement des données: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard IA Trading</h1>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="trainings">Historique des Trainings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <TrainingSynthesis trainings={trainings || []} />
        </TabsContent>
        
        <TabsContent value="trainings">
          <TrainingLogsList trainings={trainings || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
