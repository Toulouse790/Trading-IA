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
          sharpe_ratio: number | null
          source_trigger: string | null
          status: string | null
          strategy_version: string | null
          top_patterns: Json | null
          total_trades_analyzed: number | null
          training_date: string | null
          training_duration_ms: number | null
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
          sharpe_ratio?: number | null
          source_trigger?: string | null
          status?: string | null
          strategy_version?: string | null
          top_patterns?: Json | null
          total_trades_analyzed?: number | null
          training_date?: string | null
          training_duration_ms?: number | null
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
          sharpe_ratio?: number | null
          source_trigger?: string | null
          status?: string | null
          strategy_version?: string | null
          top_patterns?: Json | null
          total_trades_analyzed?: number | null
          training_date?: string | null
          training_duration_ms?: number | null
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
