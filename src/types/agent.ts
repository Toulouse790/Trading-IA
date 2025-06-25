export interface EquityDataPoint {
  date: string;
  value: number;
}

export interface Agent {
  id: string; // Ceci est l'ID de la ligne dans la table agent_metrics
  agent_id: string; // <-- NOUVEAU : C'est l'ID unique de l'agent dans votre système
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
