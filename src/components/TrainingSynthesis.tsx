import React from "react";

export type SynthesisData = {
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
  if (!response) {
    return (
      <div className="p-6 text-gray-400 italic">
        ⏳ Analyse en cours... Veuillez patienter
      </div>
    );
  }

  const Section = ({ title, items, icon }: { title: string; items: string[]; icon: string }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold">{icon} {title}</h3>
      <ul className="list-disc list-inside mt-2 text-sm text-gray-200">
        {items.map((item, i) => (
          <li key={i} className="mb-1">{item}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📊 Résumé de l'Entraînement</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold">🎯 Résumé Exécutif</h3>
        <p className="text-gray-300 mt-2 whitespace-pre-wrap text-sm">
          {response.executive_summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Patterns Gagnants" items={response.winning_patterns} icon="📈" />
        <Section title="Causes des Pertes" items={response.losing_causes} icon="❌" />
      </div>

      <Section
        title="Améliorations Stratégiques"
        items={response.strategy_improvements}
        icon="🧠"
      />
      <Section
        title="Règles de Filtrage"
        items={response.filtering_rules}
        icon="🛑"
      />
      <Section
        title="Actions Recommandées"
        items={response.recommended_actions}
        icon="🚀"
      />

      <div className="mb-4 mt-6">
        <h3 className="text-lg font-semibold">📈 Niveau Actuel</h3>
        <p className="text-blue-400 font-bold mt-1">{response.level}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold">📚 Apprentissage Continu</h3>
        <p className="text-gray-300 whitespace-pre-wrap text-sm mt-1">
          {response.continuous_learning}
        </p>
      </div>
    </div>
  );
}
