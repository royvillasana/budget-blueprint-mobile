export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      annual_goals: {
        Row: {
          created_at: string | null
          id: string
          main_financial_goal: string | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          main_financial_goal?: string | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          main_financial_goal?: string | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          actual: number | null
          category_name: string
          created_at: string | null
          estimated: number | null
          icon: string | null
          id: string
          monthly_budget_id: string
          type: string
        }
        Insert: {
          actual?: number | null
          category_name: string
          created_at?: string | null
          estimated?: number | null
          icon?: string | null
          id?: string
          monthly_budget_id: string
          type: string
        }
        Update: {
          actual?: number | null
          category_name?: string
          created_at?: string | null
          estimated?: number | null
          icon?: string | null
          id?: string
          monthly_budget_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_monthly_budget_id_fkey"
            columns: ["monthly_budget_id"]
            isOneToOne: false
            referencedRelation: "monthly_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_goals: {
        Row: {
          annual_goal_id: string
          created_at: string | null
          goal_text: string
          id: string
          is_completed: boolean | null
        }
        Insert: {
          annual_goal_id: string
          created_at?: string | null
          goal_text: string
          id?: string
          is_completed?: boolean | null
        }
        Update: {
          annual_goal_id?: string
          created_at?: string | null
          goal_text?: string
          id?: string
          is_completed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_goals_annual_goal_id_fkey"
            columns: ["annual_goal_id"]
            isOneToOne: false
            referencedRelation: "annual_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      income_items: {
        Row: {
          actual: number | null
          concept: string
          created_at: string | null
          estimated: number | null
          id: string
          monthly_budget_id: string
        }
        Insert: {
          actual?: number | null
          concept: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          monthly_budget_id: string
        }
        Update: {
          actual?: number | null
          concept?: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          monthly_budget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_items_monthly_budget_id_fkey"
            columns: ["monthly_budget_id"]
            isOneToOne: false
            referencedRelation: "monthly_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budgets: {
        Row: {
          add_previous_balance: boolean | null
          budget_allocated: number | null
          budget_from_scratch: boolean | null
          created_at: string | null
          debt_contribution: number | null
          id: string
          month: number
          monthly_goal: string | null
          previous_balance: number | null
          total_income_actual: number | null
          total_income_estimated: number | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          add_previous_balance?: boolean | null
          budget_allocated?: number | null
          budget_from_scratch?: boolean | null
          created_at?: string | null
          debt_contribution?: number | null
          id?: string
          month: number
          monthly_goal?: string | null
          previous_balance?: number | null
          total_income_actual?: number | null
          total_income_estimated?: number | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          add_previous_balance?: boolean | null
          budget_allocated?: number | null
          budget_from_scratch?: boolean | null
          created_at?: string | null
          debt_contribution?: number | null
          id?: string
          month?: number
          monthly_goal?: string | null
          previous_balance?: number | null
          total_income_actual?: number | null
          total_income_estimated?: number | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      todo_list: {
        Row: {
          created_at: string | null
          id: string
          is_completed: boolean | null
          monthly_budget_id: string
          task_text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          monthly_budget_id: string
          task_text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          monthly_budget_id?: string
          task_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "todo_list_monthly_budget_id_fkey"
            columns: ["monthly_budget_id"]
            isOneToOne: false
            referencedRelation: "monthly_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          concept: string
          created_at: string | null
          id: string
          monthly_budget_id: string
          transaction_date: string
        }
        Insert: {
          amount: number
          category: string
          concept: string
          created_at?: string | null
          id?: string
          monthly_budget_id: string
          transaction_date: string
        }
        Update: {
          amount?: number
          category?: string
          concept?: string
          created_at?: string | null
          id?: string
          monthly_budget_id?: string
          transaction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_monthly_budget_id_fkey"
            columns: ["monthly_budget_id"]
            isOneToOne: false
            referencedRelation: "monthly_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      wish_list: {
        Row: {
          created_at: string | null
          id: string
          is_completed: boolean | null
          monthly_budget_id: string
          wish_text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          monthly_budget_id: string
          wish_text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          monthly_budget_id?: string
          wish_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "wish_list_monthly_budget_id_fkey"
            columns: ["monthly_budget_id"]
            isOneToOne: false
            referencedRelation: "monthly_budgets"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
