import React from "react";

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

type Props = {
  response: SynthesisData | null;
};

export default function TrainingSynthesis({ response }: Props) {
  if (!response) return <div>⏳ Chargement des données IA...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📊 Résumé de l'Entraînement</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold">🎯 Executive Summary</h3>
        <p className="text-gray-700 mt-2 whitespace-pre-wrap">
          {response.executive_summary}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold">📈 Patterns Gagnants</h3>
        <ul className="list-disc list-inside">
          {response.winning_patterns?.map((item, i) => (
            <li key={i} className="mb-2">📈 {item}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold">❌ Causes des Pertes</h3>
        <ul className="list-disc list-inside">
          {response.losing_causes?.map((item, i) => (
            <li key={i} className="mb-2">❌ {item}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold">🧠 Améliorations Stratégiques</h3>
        <ul className="list-disc list-inside">
          {response.strategy_improvements?.map((item, i) => (
            <li key={i} className="mb-2">✅ {item}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold">🛑 Règles de Filtrage</h3>
        <ul className="list-disc list-inside">
          {response.filtering_rules?.map((item, i) => (
            <li key={i} className="mb-2">🛑 {item}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold">🚀 Actions Recommandées</h3>
        <ul className="list-disc list-inside">
          {response.recommended_actions?.map((item, i) => (
            <li key={i} className="mb-2">🚀 {item}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold">📈 Niveau Actuel</h3>
        <p className="text-blue-600 font-semibold">{response.level}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold">📚 Apprentissage Continu</h3>
        <p className="text-gray-700 whitespace-pre-wrap">
          {response.continuous_learning}
        </p>
      </div>
    </div>
  );
}
