
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
  top_patterns: any[];
  training_examples: any[];
  market_conditions: any;
  notes: string;
  status: string;
  is_best_run: boolean;
  model_version: string;
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
