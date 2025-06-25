
import React from "react";
import MetricsOverview from "@/components/MetricsOverview";
import EquityChart from "@/components/EquityChart";
import AlertsPanel from "@/components/AlertsPanel";
import TradingStatus from "@/components/TradingStatus";
import BestRuns from "@/components/BestRuns";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function DashboardIA() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard IA Trading
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Surveillance en temps réel des performances de l'agent IA
          </p>
        </div>

        <ErrorBoundary>
          <MetricsOverview />
        </ErrorBoundary>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorBoundary>
            <TradingStatus />
          </ErrorBoundary>
          <ErrorBoundary>
            <AlertsPanel />
          </ErrorBoundary>
        </div>

        <ErrorBoundary>
          <BestRuns trainings={[]} />
        </ErrorBoundary>

        <ErrorBoundary>
          <EquityChart />
        </ErrorBoundary>
      </div>
    </div>
  );
}
