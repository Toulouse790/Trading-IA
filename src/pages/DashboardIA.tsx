import React from "react";
import AIAgentPanel from "@/components/AIAgentPanel";

export default function DashboardIA() {
  // Simulé : données de logs IA (à remplacer par un fetch réel depuis Supabase)
  const trainingLogs = [
    { date: "2025-06-18", winRate: 66.7, sharpe: 1.12, pattern: "Breakout H1" },
    { date: "2025-06-19", winRate: 72.4, sharpe: 1.31, pattern: "Double Bottom" },
    { date: "2025-06-20", winRate: 74.8, sharpe: 1.44, pattern: "EMA Rebound" },
  ];

  return (
    <div className="p-6 space-y-6">
      <AIAgentPanel
        name="Expert EUR/USD – MWD Strategy"
        objective="+6 % hebdo"
        status="LEARNING"
        winRate={74.8}
        sharpeRatio={1.44}
      />

      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="text-lg font-bold mb-2">📈 Historique des entraînements</h3>
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Win Rate</th>
              <th className="text-left py-2">Sharpe</th>
              <th className="text-left py-2">Pattern dominant</th>
            </tr>
          </thead>
          <tbody>
            {trainingLogs.map((log, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-1">{log.date}</td>
                <td className="py-1">{log.winRate.toFixed(1)} %</td>
                <td className="py-1">{log.sharpe.toFixed(2)}</td>
                <td className="py-1">{log.pattern}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
