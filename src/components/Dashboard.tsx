import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TrainingSynthesis from "./TrainingSynthesis";

export default function Dashboard() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrainings() {
      const { data, error } = await supabase
        .from("synthese_finale")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Erreur lors du chargement des synthèses:", error);
      } else {
        setTrainings(data);
      }
      setLoading(false);
    }

    fetchTrainings();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🧠 Synthèse de l'apprentissage IA</h1>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <TrainingSynthesis
          response={
            trainings.length > 0 && trainings[0].content
              ? JSON.parse(trainings[0].content)
              : null
          }
        />
      )}
    </div>
  );
}
