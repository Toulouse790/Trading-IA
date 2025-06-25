export interface EquityDataPoint {
  date: string;
  value: number;
}

export interface Agent {
  id: string;
  agent_name: string;
  currency_pair: string;
  timeframe: string;
  weekly_return_percentage: number | null;
  cumulative_return_percentage: number | null;
  max_drawdown_percentage: number | null;
  current_drawdown_percentage: number | null;
  win_rate_percentage: number | null;
  status: "Actif" | "Inactif" | "En pause";
  equity_curve_data: EquityDataPoint[];
  last_updated: string;
}
