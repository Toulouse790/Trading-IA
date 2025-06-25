export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_messages: {
        Row: {
          agent_id: string
          agent_name: string | null
          contenu: string | null
          created_at: string | null
          currency_pair: string | null
          description: string | null
          etat: string | null
          id: string
          strategie: string | null
          texte_de_balise: string | null
        }
        Insert: {
          agent_id: string
          agent_name?: string | null
          contenu?: string | null
          created_at?: string | null
          currency_pair?: string | null
          description?: string | null
          etat?: string | null
          id?: string
          strategie?: string | null
          texte_de_balise?: string | null
        }
        Update: {
          agent_id?: string
          agent_name?: string | null
          contenu?: string | null
          created_at?: string | null
          currency_pair?: string | null
          description?: string | null
          etat?: string | null
          id?: string
          strategie?: string | null
          texte_de_balise?: string | null
        }
        Relationships: []
      }
      agent_metrics: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          cumulative_return_percentage: number | null
          currency_pair: string | null
          current_drawdown_percentage: number | null
          equity_curve_data: Json | null
          id: string
          last_updated: string | null
          max_drawdown_percentage: number | null
          status: string | null
          timeframe: string | null
          weekly_return_percentage: number | null
          win_rate_percentage: number | null
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          cumulative_return_percentage?: number | null
          currency_pair?: string | null
          current_drawdown_percentage?: number | null
          equity_curve_data?: Json | null
          id?: string
          last_updated?: string | null
          max_drawdown_percentage?: number | null
          status?: string | null
          timeframe?: string | null
          weekly_return_percentage?: number | null
          win_rate_percentage?: number | null
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          cumulative_return_percentage?: number | null
          currency_pair?: string | null
          current_drawdown_percentage?: number | null
          equity_curve_data?: Json | null
          id?: string
          last_updated?: string | null
          max_drawdown_percentage?: number | null
          status?: string | null
          timeframe?: string | null
          weekly_return_percentage?: number | null
          win_rate_percentage?: number | null
        }
        Relationships: []
      }
      agents: {
        Row: {
          agent_id: string
          agent_name: string
          created_at: string | null
          currency_pair: string | null
          description: string | null
          id: string
          status: string
          strategy_details: Json | null
          timeframe: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          agent_name: string
          created_at?: string | null
          currency_pair?: string | null
          description?: string | null
          id?: string
          status?: string
          strategy_details?: Json | null
          timeframe?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          agent_name?: string
          created_at?: string | null
          currency_pair?: string | null
          description?: string | null
          id?: string
          status?: string
          strategy_details?: Json | null
          timeframe?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      best_runs: {
        Row: {
          assistant_id: string
          best_pattern_name: string | null
          best_pattern_profit: number | null
          created_at: string | null
          id: string
          improvement_rate: number | null
          is_best_run: boolean | null
          run_id: string
          sharpe_ratio: number | null
          strategy_version: string | null
          total_trades_analyzed: number | null
          training_date: string
          training_level: string | null
          win_rate: number | null
        }
        Insert: {
          assistant_id: string
          best_pattern_name?: string | null
          best_pattern_profit?: number | null
          created_at?: string | null
          id?: string
          improvement_rate?: number | null
          is_best_run?: boolean | null
          run_id: string
          sharpe_ratio?: number | null
          strategy_version?: string | null
          total_trades_analyzed?: number | null
          training_date?: string
          training_level?: string | null
          win_rate?: number | null
        }
        Update: {
          assistant_id?: string
          best_pattern_name?: string | null
          best_pattern_profit?: number | null
          created_at?: string | null
          id?: string
          improvement_rate?: number | null
          is_best_run?: boolean | null
          run_id?: string
          sharpe_ratio?: number | null
          strategy_version?: string | null
          total_trades_analyzed?: number | null
          training_date?: string
          training_level?: string | null
          win_rate?: number | null
        }
        Relationships: []
      }
      candle_data: {
        Row: {
          close: number
          event_time: string
          high: number
          low: number
          open: number
          real_volume: number | null
          spread: number | null
          symbol: string
          tick_volume: number | null
          timeframe: string
        }
        Insert: {
          close: number
          event_time: string
          high: number
          low: number
          open: number
          real_volume?: number | null
          spread?: number | null
          symbol: string
          tick_volume?: number | null
          timeframe: string
        }
        Update: {
          close?: number
          event_time?: string
          high?: number
          low?: number
          open?: number
          real_volume?: number | null
          spread?: number | null
          symbol?: string
          tick_volume?: number | null
          timeframe?: string
        }
        Relationships: []
      }
      dxy_daily_data: {
        Row: {
          close_price: number
          created_at: string
          high_price: number | null
          id: string
          low_price: number | null
          open_price: number | null
          trade_date: string
          updated_at: string
          volume: number | null
        }
        Insert: {
          close_price: number
          created_at?: string
          high_price?: number | null
          id?: string
          low_price?: number | null
          open_price?: number | null
          trade_date: string
          updated_at?: string
          volume?: number | null
        }
        Update: {
          close_price?: number
          created_at?: string
          high_price?: number | null
          id?: string
          low_price?: number | null
          open_price?: number | null
          trade_date?: string
          updated_at?: string
          volume?: number | null
        }
        Relationships: []
      }
      economic_calendar: {
        Row: {
          actual_value: number | null
          created_at: string
          currency_code: string
          event_date: string
          event_name: string
          event_time: string | null
          forecast_value: number | null
          id: string
          impact_level: string | null
          previous_value: number | null
          updated_at: string
        }
        Insert: {
          actual_value?: number | null
          created_at?: string
          currency_code: string
          event_date: string
          event_name: string
          event_time?: string | null
          forecast_value?: number | null
          id?: string
          impact_level?: string | null
          previous_value?: number | null
          updated_at?: string
        }
        Update: {
          actual_value?: number | null
          created_at?: string
          currency_code?: string
          event_date?: string
          event_name?: string
          event_time?: string | null
          forecast_value?: number | null
          id?: string
          impact_level?: string | null
          previous_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      eurusd_daily: {
        Row: {
          close: number
          created_at: string | null
          high: number
          id: string
          low: number
          open: number
          timestamp: string
        }
        Insert: {
          close: number
          created_at?: string | null
          high: number
          id?: string
          low: number
          open: number
          timestamp: string
        }
        Update: {
          close?: number
          created_at?: string | null
          high?: number
          id?: string
          low?: number
          open?: number
          timestamp?: string
        }
        Relationships: []
      }
      eurusd_monthly: {
        Row: {
          close: number
          created_at: string | null
          high: number
          id: string
          low: number
          open: number
          timestamp: string
        }
        Insert: {
          close: number
          created_at?: string | null
          high: number
          id?: string
          low: number
          open: number
          timestamp: string
        }
        Update: {
          close?: number
          created_at?: string | null
          high?: number
          id?: string
          low?: number
          open?: number
          timestamp?: string
        }
        Relationships: []
      }
      eurusd_weekly: {
        Row: {
          close: number
          created_at: string | null
          high: number
          id: string
          low: number
          open: number
          timestamp: string
        }
        Insert: {
          close: number
          created_at?: string | null
          high: number
          id?: string
          low: number
          open: number
          timestamp: string
        }
        Update: {
          close?: number
          created_at?: string | null
          high?: number
          id?: string
          low?: number
          open?: number
          timestamp?: string
        }
        Relationships: []
      }
      historical_trade_outcomes: {
        Row: {
          confluence_daily_ema_status: string | null
          confluence_dxy_status: string | null
          confluence_fibo_level: number | null
          confluence_monthly_ema50_trend: string | null
          confluence_round_price_status: string | null
          confluence_weekly_sr_status: string | null
          created_at: string
          currency_pair: string
          id: string
          profit_pips_tp30: number | null
          profit_pips_tp40: number | null
          profit_pips_tp50: number | null
          setup_date: string
          setup_type: string | null
          simulated_entry_price: number
          simulated_stop_loss_price: number
          simulated_trade_duration_candles: number | null
          sl_hit: boolean | null
          tp30_reached: boolean | null
          tp40_reached: boolean | null
          tp50_reached: boolean | null
          updated_at: string
        }
        Insert: {
          confluence_daily_ema_status?: string | null
          confluence_dxy_status?: string | null
          confluence_fibo_level?: number | null
          confluence_monthly_ema50_trend?: string | null
          confluence_round_price_status?: string | null
          confluence_weekly_sr_status?: string | null
          created_at?: string
          currency_pair: string
          id?: string
          profit_pips_tp30?: number | null
          profit_pips_tp40?: number | null
          profit_pips_tp50?: number | null
          setup_date: string
          setup_type?: string | null
          simulated_entry_price: number
          simulated_stop_loss_price: number
          simulated_trade_duration_candles?: number | null
          sl_hit?: boolean | null
          tp30_reached?: boolean | null
          tp40_reached?: boolean | null
          tp50_reached?: boolean | null
          updated_at?: string
        }
        Update: {
          confluence_daily_ema_status?: string | null
          confluence_dxy_status?: string | null
          confluence_fibo_level?: number | null
          confluence_monthly_ema50_trend?: string | null
          confluence_round_price_status?: string | null
          confluence_weekly_sr_status?: string | null
          created_at?: string
          currency_pair?: string
          id?: string
          profit_pips_tp30?: number | null
          profit_pips_tp40?: number | null
          profit_pips_tp50?: number | null
          setup_date?: string
          setup_type?: string | null
          simulated_entry_price?: number
          simulated_stop_loss_price?: number
          simulated_trade_duration_candles?: number | null
          sl_hit?: boolean | null
          tp30_reached?: boolean | null
          tp40_reached?: boolean | null
          tp50_reached?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      real_trade_analysis: {
        Row: {
          analysis_date: string | null
          avg_duration_candles: number | null
          avg_profit_tp30: number | null
          avg_profit_tp40: number | null
          avg_profit_tp50: number | null
          created_at: string | null
          currency_pair: string | null
          drawdown_rate: number | null
          id: string
          reliability_score: number | null
          sl_hit: number | null
          strategy_name: string | null
          tp30_hit: number | null
          tp40_hit: number | null
          tp50_hit: number | null
          trades_analyzed: number | null
          win_rate: number | null
        }
        Insert: {
          analysis_date?: string | null
          avg_duration_candles?: number | null
          avg_profit_tp30?: number | null
          avg_profit_tp40?: number | null
          avg_profit_tp50?: number | null
          created_at?: string | null
          currency_pair?: string | null
          drawdown_rate?: number | null
          id?: string
          reliability_score?: number | null
          sl_hit?: number | null
          strategy_name?: string | null
          tp30_hit?: number | null
          tp40_hit?: number | null
          tp50_hit?: number | null
          trades_analyzed?: number | null
          win_rate?: number | null
        }
        Update: {
          analysis_date?: string | null
          avg_duration_candles?: number | null
          avg_profit_tp30?: number | null
          avg_profit_tp40?: number | null
          avg_profit_tp50?: number | null
          created_at?: string | null
          currency_pair?: string | null
          drawdown_rate?: number | null
          id?: string
          reliability_score?: number | null
          sl_hit?: number | null
          strategy_name?: string | null
          tp30_hit?: number | null
          tp40_hit?: number | null
          tp50_hit?: number | null
          trades_analyzed?: number | null
          win_rate?: number | null
        }
        Relationships: []
      }
      trading_alerts: {
        Row: {
          action_required: string | null
          alert_type: string
          created_at: string
          id: string
          message: string
          resolved: boolean
          resolved_at: string | null
          severity: string
          threshold: number | null
          updated_at: string
          value: number | null
        }
        Insert: {
          action_required?: string | null
          alert_type: string
          created_at?: string
          id?: string
          message: string
          resolved?: boolean
          resolved_at?: string | null
          severity: string
          threshold?: number | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          action_required?: string | null
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          threshold?: number | null
          updated_at?: string
          value?: number | null
        }
        Relationships: []
      }
      training_logs: {
        Row: {
          assistant_id: string | null
          average_profit_per_trade: number | null
          avg_rr_ratio: number | null
          best_pattern_name: string | null
          best_pattern_profit: number | null
          created_at: string | null
          error_rate: number | null
          file_id: string | null
          id: string
          improvement_rate: number | null
          is_best_run: boolean | null
          market_conditions: Json | null
          max_consecutive_losses: number | null
          max_consecutive_wins: number | null
          model_version: string | null
          notes: string | null
          patterns_analyzed: number | null
          profitable_patterns: number | null
          proposed_entry_criteria: string | null
          proposed_risk_rules: string | null
          proposed_strategy_details: string | null
          proposed_strategy_name: string | null
          proposed_timeframe: string | null
          proposed_tp_sl: string | null
          sharpe_ratio: number | null
          source_trigger: string | null
          status: string | null
          strategy_version: string | null
          top_patterns: Json | null
          total_trades_analyzed: number | null
          training_date: string | null
          training_examples: Json | null
          training_level: string | null
          training_session_id: string | null
          updated_at: string | null
          win_rate: number | null
          worst_pattern_loss: number | null
          worst_pattern_name: string | null
        }
        Insert: {
          assistant_id?: string | null
          average_profit_per_trade?: number | null
          avg_rr_ratio?: number | null
          best_pattern_name?: string | null
          best_pattern_profit?: number | null
          created_at?: string | null
          error_rate?: number | null
          file_id?: string | null
          id?: string
          improvement_rate?: number | null
          is_best_run?: boolean | null
          market_conditions?: Json | null
          max_consecutive_losses?: number | null
          max_consecutive_wins?: number | null
          model_version?: string | null
          notes?: string | null
          patterns_analyzed?: number | null
          profitable_patterns?: number | null
          proposed_entry_criteria?: string | null
          proposed_risk_rules?: string | null
          proposed_strategy_details?: string | null
          proposed_strategy_name?: string | null
          proposed_timeframe?: string | null
          proposed_tp_sl?: string | null
          sharpe_ratio?: number | null
          source_trigger?: string | null
          status?: string | null
          strategy_version?: string | null
          top_patterns?: Json | null
          total_trades_analyzed?: number | null
          training_date?: string | null
          training_examples?: Json | null
          training_level?: string | null
          training_session_id?: string | null
          updated_at?: string | null
          win_rate?: number | null
          worst_pattern_loss?: number | null
          worst_pattern_name?: string | null
        }
        Update: {
          assistant_id?: string | null
          average_profit_per_trade?: number | null
          avg_rr_ratio?: number | null
          best_pattern_name?: string | null
          best_pattern_profit?: number | null
          created_at?: string | null
          error_rate?: number | null
          file_id?: string | null
          id?: string
          improvement_rate?: number | null
          is_best_run?: boolean | null
          market_conditions?: Json | null
          max_consecutive_losses?: number | null
          max_consecutive_wins?: number | null
          model_version?: string | null
          notes?: string | null
          patterns_analyzed?: number | null
          profitable_patterns?: number | null
          proposed_entry_criteria?: string | null
          proposed_risk_rules?: string | null
          proposed_strategy_details?: string | null
          proposed_strategy_name?: string | null
          proposed_timeframe?: string | null
          proposed_tp_sl?: string | null
          sharpe_ratio?: number | null
          source_trigger?: string | null
          status?: string | null
          strategy_version?: string | null
          top_patterns?: Json | null
          total_trades_analyzed?: number | null
          training_date?: string | null
          training_examples?: Json | null
          training_level?: string | null
          training_session_id?: string | null
          updated_at?: string | null
          win_rate?: number | null
          worst_pattern_loss?: number | null
          worst_pattern_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      training_stats_by_week: {
        Row: {
          assistant_id: string | null
          avg_patterns_analyzed: number | null
          avg_profitable_patterns: number | null
          avg_win_rate: number | null
          best_week_win_rate: number | null
          total_runs: number | null
          week: string | null
          worst_week_win_rate: number | null
        }
        Relationships: []
      }
      vw_eurusd_daily_sorted: {
        Row: {
          close: number | null
          high: number | null
          low: number | null
          open: number | null
          timestamp: string | null
        }
        Insert: {
          close?: number | null
          high?: number | null
          low?: number | null
          open?: number | null
          timestamp?: string | null
        }
        Update: {
          close?: number | null
          high?: number | null
          low?: number | null
          open?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
