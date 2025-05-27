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
      Agent_messages: {
        Row: {
          agent_id: string | null
          confiance: number | null
          contenu: string | null
          created_at: string
          etat: string | null
          horodatage: string | null
          id: number
          role: string | null
          strategie: string | null
          tag: string | null
          texte_de_balise: string | null
          texte_de_stratégie: string | null
          thread_id: string
          type_message: string | null
        }
        Insert: {
          agent_id?: string | null
          confiance?: number | null
          contenu?: string | null
          created_at?: string
          etat?: string | null
          horodatage?: string | null
          id?: number
          role?: string | null
          strategie?: string | null
          tag?: string | null
          texte_de_balise?: string | null
          texte_de_stratégie?: string | null
          thread_id: string
          type_message?: string | null
        }
        Update: {
          agent_id?: string | null
          confiance?: number | null
          contenu?: string | null
          created_at?: string
          etat?: string | null
          horodatage?: string | null
          id?: number
          role?: string | null
          strategie?: string | null
          tag?: string | null
          texte_de_balise?: string | null
          texte_de_stratégie?: string | null
          thread_id?: string
          type_message?: string | null
        }
        Relationships: []
      }
      bougies_eurusd_h1: {
        Row: {
          close: number | null
          high: number | null
          horodatage: string
          low: number | null
          open: number | null
        }
        Insert: {
          close?: number | null
          high?: number | null
          horodatage: string
          low?: number | null
          open?: number | null
        }
        Update: {
          close?: number | null
          high?: number | null
          horodatage?: string
          low?: number | null
          open?: number | null
        }
        Relationships: []
      }
      historique_backtests_eurusd: {
        Row: {
          date: string | null
          id: string
          nb_trades: number | null
          note_strategie: number | null
          perte_max: number | null
          rendement: number | null
          taux_reussite: number | null
          texte_recommandation: string | null
        }
        Insert: {
          date?: string | null
          id?: string
          nb_trades?: number | null
          note_strategie?: number | null
          perte_max?: number | null
          rendement?: number | null
          taux_reussite?: number | null
          texte_recommandation?: string | null
        }
        Update: {
          date?: string | null
          id?: string
          nb_trades?: number | null
          note_strategie?: number | null
          perte_max?: number | null
          rendement?: number | null
          taux_reussite?: number | null
          texte_recommandation?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
