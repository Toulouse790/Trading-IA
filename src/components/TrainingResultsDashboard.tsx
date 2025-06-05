
import { AgentCard } from "./AgentCard";
import { PerformanceStats } from "./PerformanceStats";

export default function TrainingResultsDashboard({ data }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <AgentCard name="EUR/USD - MWD" winRate={data?.win_rate || 0} />
      <PerformanceStats title="Profitable Patterns" value={data?.profitable_patterns?.toString() || "0"} />
      <PerformanceStats title="Best Pattern" value={data?.best_pattern_name || "N/A"} subtitle={`${data?.best_pattern_profit || 0}%`} />
      <PerformanceStats title="Trades Analysed" value={data?.total_trades_analyzed?.toString() || "0"} />
      <PerformanceStats title="Sharpe Ratio" value={data?.sharpe_ratio?.toFixed(2) || "0.00"} />
      <PerformanceStats title="Drawdown Max" value={data?.max_consecutive_losses?.toString() || "0"} />
    </div>
  );
}
