
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrainingLog {
  id: string;
  training_date: string;
  assistant_id: string;
  win_rate: number;
  best_pattern_name: string;
  strategy_version: string;
  sharpe_ratio: number;
  max_consecutive_losses: number;
  avg_rr_ratio: number;
  best_pattern_profit: number;
  total_trades_analyzed: number;
  profitable_patterns: number;
  top_patterns: any[]; // Changed from any[] to any to match JSON type
  training_examples: any[];
  market_conditions: any;
  notes: string;
  status: string;
  is_best_run: boolean;
  model_version: string;
  training_duration_ms: number; // Added missing property
  error_rate: number;
  average_profit_per_trade: number;
  improvement_rate: number;
  patterns_analyzed: number;
  max_consecutive_wins: number;
  worst_pattern_name: string;
  worst_pattern_loss: number;
  file_id: string;
  training_session_id: string;
  training_level: string;
  source_trigger: string;
  created_at: string;
  updated_at: string;
}

export const useTrainingLogs = () => {
  return useQuery({
    queryKey: ['training_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_logs')
        .select('*')
        .order('training_date', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as TrainingLog[];
    },
  });
};

export const useLatestTrainingLog = () => {
  return useQuery({
    queryKey: ['latest_training_log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_logs')
        .select('*')
        .order('training_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as TrainingLog | null;
    },
  });
};
