
import TrainingResultsDashboard from "@/components/TrainingResultsDashboard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const { data: trainingData, error } = await supabase
          .from("training_logs")
          .select("*")
          .order("training_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) {
          setError(error.message);
        } else {
          setData(trainingData);
        }
      } catch (err) {
        setError("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

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
          <CardContent className="p-6">
            <p className="text-destructive-foreground">Erreur: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard IA Trading</h1>
      <TrainingResultsDashboard data={data} />
    </div>
  );
}
