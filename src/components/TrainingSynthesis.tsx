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
      <h2 className="text-xl font-bold mb-6">📊 Résumé IA Trading</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bloc Résumé Statistique */}
        <div className="bg-muted p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">🧠 Résumé IA</h3>
          <ul className="text-sm leading-6">
            <li>🧪 Sessions totales : <strong>{response.executive_summary.match(/\d+/)?.[0] || "-"}</strong></li>
            <li>✅ Win Rate moyen : <strong>{response.executive_summary.match(/\d+\.\d+%/)?.[0] || "-"}</strong></li>
            <li>📈 Sharpe Ratio moyen : <strong>{response.executive_summary.match(/\d+\.\d+(?=\.)/)?.[0] || "-"}</strong></li>
            <li>🔥 Niveau actuel : <strong>{response.level}</strong></li>
          </ul>
        </div>

        {/* Bloc Patterns et Causes */}
        <div className="bg-muted p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">📌 Insights stratégiques</h3>
          <ul className="text-sm leading-6">
            <li>📊 Pattern dominant : <strong>{response.winning_patterns[0] || "N/A"}</strong></li>
            <li>❌ Cause dominante : <strong>{response.losing_causes[0] || "N/A"}</strong></li>
            <li>📚 Apprentissage : <em>{response.continuous_learning}</em></li>
          </ul>
        </div>
      </div>

      {/* Bloc Actions proposées */}
      <div className="mt-8 bg-muted p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">🛠️ Recommandations stratégiques</h3>
        <ul className="list-disc list-inside text-sm text-gray-300">
          {response.strategy_improvements.map((item, i) => (
            <li key={i}>✅ {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
