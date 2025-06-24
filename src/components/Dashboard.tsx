"use client";

import { useEffect, useState } from "react";
import TrainingSynthesis from "./TrainingSynthesis";

type SynthesisData = {
  executive_summary: string;
  winning_patterns: string[];
  losing_causes: string[];
  strategy_improvements: string[];
  filtering_rules: string[];
  recommended_actions: string[];
  level: string;
  continuous_learning: string;
};

export default function Dashboard() {
  const [syntheseFinale, setSyntheseFinale] = useState<SynthesisData | null>(null);

  useEffect(() => {
    const fetchSynthesis = async () => {
      const res = await fetch("/api/synthese_finale");
      if (res.ok) {
        const data = await res.json();
        setSyntheseFinale(data);
      }
    };

    fetchSynthesis();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tableau de Bord - Agent IA Trading</h1>
      <TrainingSynthesis response={syntheseFinale} />
    </div>
  );
}
