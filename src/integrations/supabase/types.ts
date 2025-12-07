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
      accounts: {
        Row: {
          created_at: string | null
          currency_code: string
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency_code: string
          id?: string
          name: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency_code?: string
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
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
      categories: {
        Row: {
          bucket_50_30_20: string
          created_at: string | null
          emoji: string | null
          id: string
          is_active: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          bucket_50_30_20: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          bucket_50_30_20?: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          rate_to_eur: number | null
          rate_to_usd: number | null
          symbol: string
          updated_at: string | null
        }
        Insert: {
          code: string
          rate_to_eur?: number | null
          rate_to_usd?: number | null
          symbol: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          rate_to_eur?: number | null
          rate_to_usd?: number | null
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
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
      monthly_budget_apr: {
        Row: {
          actual: number | null
          assigned: number | null
          bucket_50_30_20: string
          category_id: string
          created_at: string | null
          estimated: number | null
          id: string
          month_id: number
          updated_at: string | null
          user_id: string
          variance: number | null
        }
        Insert: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20: string
          category_id: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id: number
          updated_at?: string | null
          user_id: string
          variance?: number | null
        }
        Update: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20?: string
          category_id?: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id?: number
          updated_at?: string | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budget_apr_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budget_aug: {
        Row: {
          actual: number | null
          assigned: number | null
          bucket_50_30_20: string
          category_id: string
          created_at: string | null
          estimated: number | null
          id: string
          month_id: number
          updated_at: string | null
          user_id: string
          variance: number | null
        }
        Insert: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20: string
          category_id: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id: number
          updated_at?: string | null
          user_id: string
          variance?: number | null
        }
        Update: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20?: string
          category_id?: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id?: number
          updated_at?: string | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budget_aug_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budget_dec: {
        Row: {
          actual: number | null
          assigned: number | null
          bucket_50_30_20: string
          category_id: string
          created_at: string | null
          estimated: number | null
          id: string
          month_id: number
          updated_at: string | null
          user_id: string
          variance: number | null
        }
        Insert: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20: string
          category_id: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id: number
          updated_at?: string | null
          user_id: string
          variance?: number | null
        }
        Update: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20?: string
          category_id?: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id?: number
          updated_at?: string | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budget_dec_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budget_feb: {
        Row: {
          actual: number | null
          assigned: number | null
          bucket_50_30_20: string
          category_id: string
          created_at: string | null
          estimated: number | null
          id: string
          month_id: number
          updated_at: string | null
          user_id: string
          variance: number | null
        }
        Insert: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20: string
          category_id: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id: number
          updated_at?: string | null
          user_id: string
          variance?: number | null
        }
        Update: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20?: string
          category_id?: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id?: number
          updated_at?: string | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budget_feb_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budget_jan: {
        Row: {
          actual: number | null
          assigned: number | null
          bucket_50_30_20: string
          category_id: string
          created_at: string | null
          estimated: number | null
          id: string
          month_id: number
          updated_at: string | null
          user_id: string
          variance: number | null
        }
        Insert: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20: string
          category_id: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id: number
          updated_at?: string | null
          user_id: string
          variance?: number | null
        }
        Update: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20?: string
          category_id?: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id?: number
          updated_at?: string | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budget_jan_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_budget_jan_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "months"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_budget_jan_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "view_monthly_summary"
            referencedColumns: ["month_id"]
          },
        ]
      }
      monthly_budget_jul: {
        Row: {
          actual: number | null
          assigned: number | null
          bucket_50_30_20: string
          category_id: string
          created_at: string | null
          estimated: number | null
          id: string
          month_id: number
          updated_at: string | null
          user_id: string
          variance: number | null
        }
        Insert: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20: string
          category_id: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id: number
          updated_at?: string | null
          user_id: string
          variance?: number | null
        }
        Update: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20?: string
          category_id?: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id?: number
          updated_at?: string | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budget_jul_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budget_jun: {
        Row: {
          actual: number | null
          assigned: number | null
          bucket_50_30_20: string
          category_id: string
          created_at: string | null
          estimated: number | null
          id: string
          month_id: number
          updated_at: string | null
          user_id: string
          variance: number | null
        }
        Insert: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20: string
          category_id: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id: number
          updated_at?: string | null
          user_id: string
          variance?: number | null
        }
        Update: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20?: string
          category_id?: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id?: number
          updated_at?: string | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budget_jun_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budget_mar: {
        Row: {
          actual: number | null
          assigned: number | null
          bucket_50_30_20: string
          category_id: string
          created_at: string | null
          estimated: number | null
          id: string
          month_id: number
          updated_at: string | null
          user_id: string
          variance: number | null
        }
        Insert: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20: string
          category_id: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id: number
          updated_at?: string | null
          user_id: string
          variance?: number | null
        }
        Update: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20?: string
          category_id?: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id?: number
          updated_at?: string | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budget_mar_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budget_may: {
        Row: {
          actual: number | null
          assigned: number | null
          bucket_50_30_20: string
          category_id: string
          created_at: string | null
          estimated: number | null
          id: string
          month_id: number
          updated_at: string | null
          user_id: string
          variance: number | null
        }
        Insert: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20: string
          category_id: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id: number
          updated_at?: string | null
          user_id: string
          variance?: number | null
        }
        Update: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20?: string
          category_id?: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id?: number
          updated_at?: string | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budget_may_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budget_nov: {
        Row: {
          actual: number | null
          assigned: number | null
          bucket_50_30_20: string
          category_id: string
          created_at: string | null
          estimated: number | null
          id: string
          month_id: number
          updated_at: string | null
          user_id: string
          variance: number | null
        }
        Insert: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20: string
          category_id: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id: number
          updated_at?: string | null
          user_id: string
          variance?: number | null
        }
        Update: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20?: string
          category_id?: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id?: number
          updated_at?: string | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budget_nov_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budget_oct: {
        Row: {
          actual: number | null
          assigned: number | null
          bucket_50_30_20: string
          category_id: string
          created_at: string | null
          estimated: number | null
          id: string
          month_id: number
          updated_at: string | null
          user_id: string
          variance: number | null
        }
        Insert: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20: string
          category_id: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id: number
          updated_at?: string | null
          user_id: string
          variance?: number | null
        }
        Update: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20?: string
          category_id?: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id?: number
          updated_at?: string | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budget_oct_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budget_sep: {
        Row: {
          actual: number | null
          assigned: number | null
          bucket_50_30_20: string
          category_id: string
          created_at: string | null
          estimated: number | null
          id: string
          month_id: number
          updated_at: string | null
          user_id: string
          variance: number | null
        }
        Insert: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20: string
          category_id: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id: number
          updated_at?: string | null
          user_id: string
          variance?: number | null
        }
        Update: {
          actual?: number | null
          assigned?: number | null
          bucket_50_30_20?: string
          category_id?: string
          created_at?: string | null
          estimated?: number | null
          id?: string
          month_id?: number
          updated_at?: string | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budget_sep_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
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
      monthly_debts_apr: {
        Row: {
          created_at: string | null
          debt_account_id: string
          due_day: number | null
          ending_balance: number | null
          id: string
          interest_rate_apr: number | null
          min_payment: number
          month_id: number
          payment_made: number | null
          starting_balance: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_account_id: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment: number
          month_id: number
          payment_made?: number | null
          starting_balance: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_account_id?: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment?: number
          month_id?: number
          payment_made?: number | null
          starting_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_debts_apr_debt_account_id_fkey"
            columns: ["debt_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_debts_aug: {
        Row: {
          created_at: string | null
          debt_account_id: string
          due_day: number | null
          ending_balance: number | null
          id: string
          interest_rate_apr: number | null
          min_payment: number
          month_id: number
          payment_made: number | null
          starting_balance: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_account_id: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment: number
          month_id: number
          payment_made?: number | null
          starting_balance: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_account_id?: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment?: number
          month_id?: number
          payment_made?: number | null
          starting_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_debts_aug_debt_account_id_fkey"
            columns: ["debt_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_debts_dec: {
        Row: {
          created_at: string | null
          debt_account_id: string
          due_day: number | null
          ending_balance: number | null
          id: string
          interest_rate_apr: number | null
          min_payment: number
          month_id: number
          payment_made: number | null
          starting_balance: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_account_id: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment: number
          month_id: number
          payment_made?: number | null
          starting_balance: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_account_id?: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment?: number
          month_id?: number
          payment_made?: number | null
          starting_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_debts_dec_debt_account_id_fkey"
            columns: ["debt_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_debts_feb: {
        Row: {
          created_at: string | null
          debt_account_id: string
          due_day: number | null
          ending_balance: number | null
          id: string
          interest_rate_apr: number | null
          min_payment: number
          month_id: number
          payment_made: number | null
          starting_balance: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_account_id: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment: number
          month_id: number
          payment_made?: number | null
          starting_balance: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_account_id?: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment?: number
          month_id?: number
          payment_made?: number | null
          starting_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_debts_feb_debt_account_id_fkey"
            columns: ["debt_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_debts_jan: {
        Row: {
          created_at: string | null
          debt_account_id: string
          due_day: number | null
          ending_balance: number | null
          id: string
          interest_rate_apr: number | null
          min_payment: number
          month_id: number
          payment_made: number | null
          starting_balance: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_account_id: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment: number
          month_id: number
          payment_made?: number | null
          starting_balance: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_account_id?: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment?: number
          month_id?: number
          payment_made?: number | null
          starting_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_debts_jan_debt_account_id_fkey"
            columns: ["debt_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_debts_jan_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "months"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_debts_jan_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "view_monthly_summary"
            referencedColumns: ["month_id"]
          },
        ]
      }
      monthly_debts_jul: {
        Row: {
          created_at: string | null
          debt_account_id: string
          due_day: number | null
          ending_balance: number | null
          id: string
          interest_rate_apr: number | null
          min_payment: number
          month_id: number
          payment_made: number | null
          starting_balance: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_account_id: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment: number
          month_id: number
          payment_made?: number | null
          starting_balance: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_account_id?: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment?: number
          month_id?: number
          payment_made?: number | null
          starting_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_debts_jul_debt_account_id_fkey"
            columns: ["debt_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_debts_jun: {
        Row: {
          created_at: string | null
          debt_account_id: string
          due_day: number | null
          ending_balance: number | null
          id: string
          interest_rate_apr: number | null
          min_payment: number
          month_id: number
          payment_made: number | null
          starting_balance: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_account_id: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment: number
          month_id: number
          payment_made?: number | null
          starting_balance: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_account_id?: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment?: number
          month_id?: number
          payment_made?: number | null
          starting_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_debts_jun_debt_account_id_fkey"
            columns: ["debt_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_debts_mar: {
        Row: {
          created_at: string | null
          debt_account_id: string
          due_day: number | null
          ending_balance: number | null
          id: string
          interest_rate_apr: number | null
          min_payment: number
          month_id: number
          payment_made: number | null
          starting_balance: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_account_id: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment: number
          month_id: number
          payment_made?: number | null
          starting_balance: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_account_id?: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment?: number
          month_id?: number
          payment_made?: number | null
          starting_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_debts_mar_debt_account_id_fkey"
            columns: ["debt_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_debts_may: {
        Row: {
          created_at: string | null
          debt_account_id: string
          due_day: number | null
          ending_balance: number | null
          id: string
          interest_rate_apr: number | null
          min_payment: number
          month_id: number
          payment_made: number | null
          starting_balance: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_account_id: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment: number
          month_id: number
          payment_made?: number | null
          starting_balance: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_account_id?: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment?: number
          month_id?: number
          payment_made?: number | null
          starting_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_debts_may_debt_account_id_fkey"
            columns: ["debt_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_debts_nov: {
        Row: {
          created_at: string | null
          debt_account_id: string
          due_day: number | null
          ending_balance: number | null
          id: string
          interest_rate_apr: number | null
          min_payment: number
          month_id: number
          payment_made: number | null
          starting_balance: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_account_id: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment: number
          month_id: number
          payment_made?: number | null
          starting_balance: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_account_id?: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment?: number
          month_id?: number
          payment_made?: number | null
          starting_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_debts_nov_debt_account_id_fkey"
            columns: ["debt_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_debts_oct: {
        Row: {
          created_at: string | null
          debt_account_id: string
          due_day: number | null
          ending_balance: number | null
          id: string
          interest_rate_apr: number | null
          min_payment: number
          month_id: number
          payment_made: number | null
          starting_balance: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_account_id: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment: number
          month_id: number
          payment_made?: number | null
          starting_balance: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_account_id?: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment?: number
          month_id?: number
          payment_made?: number | null
          starting_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_debts_oct_debt_account_id_fkey"
            columns: ["debt_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_debts_sep: {
        Row: {
          created_at: string | null
          debt_account_id: string
          due_day: number | null
          ending_balance: number | null
          id: string
          interest_rate_apr: number | null
          min_payment: number
          month_id: number
          payment_made: number | null
          starting_balance: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debt_account_id: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment: number
          month_id: number
          payment_made?: number | null
          starting_balance: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          debt_account_id?: string
          due_day?: number | null
          ending_balance?: number | null
          id?: string
          interest_rate_apr?: number | null
          min_payment?: number
          month_id?: number
          payment_made?: number | null
          starting_balance?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_debts_sep_debt_account_id_fkey"
            columns: ["debt_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_income_apr: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          currency_code: string
          date: string
          id: string
          month_id: number
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          currency_code: string
          date: string
          id?: string
          month_id: number
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          id?: string
          month_id?: number
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_income_aug: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          currency_code: string
          date: string
          id: string
          month_id: number
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          currency_code: string
          date: string
          id?: string
          month_id: number
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          id?: string
          month_id?: number
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_income_dec: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          currency_code: string
          date: string
          id: string
          month_id: number
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          currency_code: string
          date: string
          id?: string
          month_id: number
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          id?: string
          month_id?: number
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_income_feb: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          currency_code: string
          date: string
          id: string
          month_id: number
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          currency_code: string
          date: string
          id?: string
          month_id: number
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          id?: string
          month_id?: number
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_income_jan: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          currency_code: string
          date: string
          id: string
          month_id: number
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          currency_code: string
          date: string
          id?: string
          month_id: number
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          id?: string
          month_id?: number
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_income_jan_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_income_jan_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "monthly_income_jan_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "months"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_income_jan_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "view_monthly_summary"
            referencedColumns: ["month_id"]
          },
        ]
      }
      monthly_income_jul: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          currency_code: string
          date: string
          id: string
          month_id: number
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          currency_code: string
          date: string
          id?: string
          month_id: number
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          id?: string
          month_id?: number
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_income_jun: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          currency_code: string
          date: string
          id: string
          month_id: number
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          currency_code: string
          date: string
          id?: string
          month_id: number
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          id?: string
          month_id?: number
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_income_mar: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          currency_code: string
          date: string
          id: string
          month_id: number
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          currency_code: string
          date: string
          id?: string
          month_id: number
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          id?: string
          month_id?: number
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_income_may: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          currency_code: string
          date: string
          id: string
          month_id: number
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          currency_code: string
          date: string
          id?: string
          month_id: number
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          id?: string
          month_id?: number
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_income_nov: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          currency_code: string
          date: string
          id: string
          month_id: number
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          currency_code: string
          date: string
          id?: string
          month_id: number
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          id?: string
          month_id?: number
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_income_oct: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          currency_code: string
          date: string
          id: string
          month_id: number
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          currency_code: string
          date: string
          id?: string
          month_id: number
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          id?: string
          month_id?: number
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_income_sep: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          currency_code: string
          date: string
          id: string
          month_id: number
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          currency_code: string
          date: string
          id?: string
          month_id: number
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          currency_code?: string
          date?: string
          id?: string
          month_id?: number
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_settings_apr: {
        Row: {
          budget_mode: string
          carryover_prev_balance: number | null
          created_at: string | null
          id: string
          month_id: number
          monthly_challenge: string | null
          unassigned_pool: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id?: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_settings_aug: {
        Row: {
          budget_mode: string
          carryover_prev_balance: number | null
          created_at: string | null
          id: string
          month_id: number
          monthly_challenge: string | null
          unassigned_pool: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id?: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_settings_dec: {
        Row: {
          budget_mode: string
          carryover_prev_balance: number | null
          created_at: string | null
          id: string
          month_id: number
          monthly_challenge: string | null
          unassigned_pool: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id?: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_settings_feb: {
        Row: {
          budget_mode: string
          carryover_prev_balance: number | null
          created_at: string | null
          id: string
          month_id: number
          monthly_challenge: string | null
          unassigned_pool: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id?: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_settings_jan: {
        Row: {
          budget_mode: string
          carryover_prev_balance: number | null
          created_at: string | null
          id: string
          month_id: number
          monthly_challenge: string | null
          unassigned_pool: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id?: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_settings_jan_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "months"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_settings_jan_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "view_monthly_summary"
            referencedColumns: ["month_id"]
          },
        ]
      }
      monthly_settings_jul: {
        Row: {
          budget_mode: string
          carryover_prev_balance: number | null
          created_at: string | null
          id: string
          month_id: number
          monthly_challenge: string | null
          unassigned_pool: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id?: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_settings_jun: {
        Row: {
          budget_mode: string
          carryover_prev_balance: number | null
          created_at: string | null
          id: string
          month_id: number
          monthly_challenge: string | null
          unassigned_pool: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id?: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_settings_mar: {
        Row: {
          budget_mode: string
          carryover_prev_balance: number | null
          created_at: string | null
          id: string
          month_id: number
          monthly_challenge: string | null
          unassigned_pool: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id?: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_settings_may: {
        Row: {
          budget_mode: string
          carryover_prev_balance: number | null
          created_at: string | null
          id: string
          month_id: number
          monthly_challenge: string | null
          unassigned_pool: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id?: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_settings_nov: {
        Row: {
          budget_mode: string
          carryover_prev_balance: number | null
          created_at: string | null
          id: string
          month_id: number
          monthly_challenge: string | null
          unassigned_pool: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id?: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_settings_oct: {
        Row: {
          budget_mode: string
          carryover_prev_balance: number | null
          created_at: string | null
          id: string
          month_id: number
          monthly_challenge: string | null
          unassigned_pool: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id?: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_settings_sep: {
        Row: {
          budget_mode: string
          carryover_prev_balance: number | null
          created_at: string | null
          id: string
          month_id: number
          monthly_challenge: string | null
          unassigned_pool: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_mode?: string
          carryover_prev_balance?: number | null
          created_at?: string | null
          id?: string
          month_id?: number
          monthly_challenge?: string | null
          unassigned_pool?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_transactions_apr: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string
          created_at: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id: string
          month_id: number
          notes: string | null
          payment_method_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id: string
          created_at?: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id?: string
          month_id: number
          notes?: string | null
          payment_method_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string
          direction?: string
          id?: string
          month_id?: number
          notes?: string | null
          payment_method_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_transactions_apr_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_apr_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_apr_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_transactions_aug: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string
          created_at: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id: string
          month_id: number
          notes: string | null
          payment_method_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id: string
          created_at?: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id?: string
          month_id: number
          notes?: string | null
          payment_method_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string
          direction?: string
          id?: string
          month_id?: number
          notes?: string | null
          payment_method_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_transactions_aug_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_aug_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_aug_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_transactions_dec: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string
          created_at: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id: string
          month_id: number
          notes: string | null
          payment_method_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id: string
          created_at?: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id?: string
          month_id: number
          notes?: string | null
          payment_method_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string
          direction?: string
          id?: string
          month_id?: number
          notes?: string | null
          payment_method_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_transactions_dec_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_dec_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_dec_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_transactions_feb: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string
          created_at: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id: string
          month_id: number
          notes: string | null
          payment_method_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id: string
          created_at?: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id?: string
          month_id: number
          notes?: string | null
          payment_method_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string
          direction?: string
          id?: string
          month_id?: number
          notes?: string | null
          payment_method_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_transactions_feb_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_feb_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_feb_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_transactions_jan: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string
          created_at: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id: string
          month_id: number
          notes: string | null
          payment_method_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id: string
          created_at?: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id?: string
          month_id: number
          notes?: string | null
          payment_method_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string
          direction?: string
          id?: string
          month_id?: number
          notes?: string | null
          payment_method_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_transactions_jan_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_jan_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_jan_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "monthly_transactions_jan_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "months"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_jan_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "view_monthly_summary"
            referencedColumns: ["month_id"]
          },
          {
            foreignKeyName: "monthly_transactions_jan_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_transactions_jul: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string
          created_at: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id: string
          month_id: number
          notes: string | null
          payment_method_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id: string
          created_at?: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id?: string
          month_id: number
          notes?: string | null
          payment_method_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string
          direction?: string
          id?: string
          month_id?: number
          notes?: string | null
          payment_method_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_transactions_jul_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_jul_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_jul_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_transactions_jun: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string
          created_at: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id: string
          month_id: number
          notes: string | null
          payment_method_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id: string
          created_at?: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id?: string
          month_id: number
          notes?: string | null
          payment_method_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string
          direction?: string
          id?: string
          month_id?: number
          notes?: string | null
          payment_method_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_transactions_jun_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_jun_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_jun_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_transactions_mar: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string
          created_at: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id: string
          month_id: number
          notes: string | null
          payment_method_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id: string
          created_at?: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id?: string
          month_id: number
          notes?: string | null
          payment_method_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string
          direction?: string
          id?: string
          month_id?: number
          notes?: string | null
          payment_method_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_transactions_mar_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_mar_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_mar_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_transactions_may: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string
          created_at: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id: string
          month_id: number
          notes: string | null
          payment_method_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id: string
          created_at?: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id?: string
          month_id: number
          notes?: string | null
          payment_method_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string
          direction?: string
          id?: string
          month_id?: number
          notes?: string | null
          payment_method_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_transactions_may_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_may_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_may_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_transactions_nov: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string
          created_at: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id: string
          month_id: number
          notes: string | null
          payment_method_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id: string
          created_at?: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id?: string
          month_id: number
          notes?: string | null
          payment_method_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string
          direction?: string
          id?: string
          month_id?: number
          notes?: string | null
          payment_method_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_transactions_nov_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_nov_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_nov_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_transactions_oct: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string
          created_at: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id: string
          month_id: number
          notes: string | null
          payment_method_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id: string
          created_at?: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id?: string
          month_id: number
          notes?: string | null
          payment_method_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string
          direction?: string
          id?: string
          month_id?: number
          notes?: string | null
          payment_method_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_transactions_oct_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_oct_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_oct_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_transactions_sep: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string
          created_at: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id: string
          month_id: number
          notes: string | null
          payment_method_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id: string
          created_at?: string | null
          currency_code: string
          date: string
          description: string
          direction: string
          id?: string
          month_id: number
          notes?: string | null
          payment_method_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string
          created_at?: string | null
          currency_code?: string
          date?: string
          description?: string
          direction?: string
          id?: string
          month_id?: number
          notes?: string | null
          payment_method_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_transactions_sep_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_sep_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_transactions_sep_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_wishlist_apr: {
        Row: {
          acquired: boolean | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          item: string
          month_id: number
          priority: string | null
          user_id: string
        }
        Insert: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item: string
          month_id: number
          priority?: string | null
          user_id: string
        }
        Update: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item?: string
          month_id?: number
          priority?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_wishlist_aug: {
        Row: {
          acquired: boolean | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          item: string
          month_id: number
          priority: string | null
          user_id: string
        }
        Insert: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item: string
          month_id: number
          priority?: string | null
          user_id: string
        }
        Update: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item?: string
          month_id?: number
          priority?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_wishlist_dec: {
        Row: {
          acquired: boolean | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          item: string
          month_id: number
          priority: string | null
          user_id: string
        }
        Insert: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item: string
          month_id: number
          priority?: string | null
          user_id: string
        }
        Update: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item?: string
          month_id?: number
          priority?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_wishlist_feb: {
        Row: {
          acquired: boolean | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          item: string
          month_id: number
          priority: string | null
          user_id: string
        }
        Insert: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item: string
          month_id: number
          priority?: string | null
          user_id: string
        }
        Update: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item?: string
          month_id?: number
          priority?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_wishlist_jan: {
        Row: {
          acquired: boolean | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          item: string
          month_id: number
          priority: string | null
          user_id: string
        }
        Insert: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item: string
          month_id: number
          priority?: string | null
          user_id: string
        }
        Update: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item?: string
          month_id?: number
          priority?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_wishlist_jan_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_wishlist_jan_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "months"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_wishlist_jan_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "view_monthly_summary"
            referencedColumns: ["month_id"]
          },
        ]
      }
      monthly_wishlist_jul: {
        Row: {
          acquired: boolean | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          item: string
          month_id: number
          priority: string | null
          user_id: string
        }
        Insert: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item: string
          month_id: number
          priority?: string | null
          user_id: string
        }
        Update: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item?: string
          month_id?: number
          priority?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_wishlist_jun: {
        Row: {
          acquired: boolean | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          item: string
          month_id: number
          priority: string | null
          user_id: string
        }
        Insert: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item: string
          month_id: number
          priority?: string | null
          user_id: string
        }
        Update: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item?: string
          month_id?: number
          priority?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_wishlist_mar: {
        Row: {
          acquired: boolean | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          item: string
          month_id: number
          priority: string | null
          user_id: string
        }
        Insert: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item: string
          month_id: number
          priority?: string | null
          user_id: string
        }
        Update: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item?: string
          month_id?: number
          priority?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_wishlist_may: {
        Row: {
          acquired: boolean | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          item: string
          month_id: number
          priority: string | null
          user_id: string
        }
        Insert: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item: string
          month_id: number
          priority?: string | null
          user_id: string
        }
        Update: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item?: string
          month_id?: number
          priority?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_wishlist_nov: {
        Row: {
          acquired: boolean | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          item: string
          month_id: number
          priority: string | null
          user_id: string
        }
        Insert: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item: string
          month_id: number
          priority?: string | null
          user_id: string
        }
        Update: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item?: string
          month_id?: number
          priority?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_wishlist_oct: {
        Row: {
          acquired: boolean | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          item: string
          month_id: number
          priority: string | null
          user_id: string
        }
        Insert: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item: string
          month_id: number
          priority?: string | null
          user_id: string
        }
        Update: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item?: string
          month_id?: number
          priority?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_wishlist_sep: {
        Row: {
          acquired: boolean | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          item: string
          month_id: number
          priority: string | null
          user_id: string
        }
        Insert: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item: string
          month_id: number
          priority?: string | null
          user_id: string
        }
        Update: {
          acquired?: boolean | null
          category_id?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          item?: string
          month_id?: number
          priority?: string | null
          user_id?: string
        }
        Relationships: []
      }
      months: {
        Row: {
          created_at: string | null
          end_date: string
          id: number
          name: string
          start_date: string
          year: number
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id: number
          name: string
          start_date: string
          year?: number
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: number
          name?: string
          start_date?: string
          year?: number
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string
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
      view_annual_summary: {
        Row: {
          annual_debt_payments: number | null
          annual_expenses: number | null
          annual_future_actual: number | null
          annual_future_assigned: number | null
          annual_income: number | null
          annual_needs_actual: number | null
          annual_needs_assigned: number | null
          annual_net_cash_flow: number | null
          annual_wants_actual: number | null
          annual_wants_assigned: number | null
          annual_wishlist_cost: number | null
          avg_monthly_expenses: number | null
          avg_monthly_income: number | null
          avg_monthly_net_cash_flow: number | null
          total_wishlist_items: number | null
          user_id: string | null
        }
        Relationships: []
      }
      view_budget_all: {
        Row: {
          actual: number | null
          assigned: number | null
          bucket_50_30_20: string | null
          category_id: string | null
          created_at: string | null
          estimated: number | null
          id: string | null
          month_abbr: string | null
          month_id: number | null
          updated_at: string | null
          user_id: string | null
          variance: number | null
        }
        Relationships: []
      }
      view_debts_all: {
        Row: {
          created_at: string | null
          debt_account_id: string | null
          due_day: number | null
          ending_balance: number | null
          id: string | null
          interest_rate_apr: number | null
          min_payment: number | null
          month_abbr: string | null
          month_id: number | null
          payment_made: number | null
          starting_balance: number | null
          user_id: string | null
        }
        Relationships: []
      }
      view_income_all: {
        Row: {
          account_id: string | null
          amount: number | null
          created_at: string | null
          currency_code: string | null
          date: string | null
          id: string | null
          month_abbr: string | null
          month_id: number | null
          notes: string | null
          source: string | null
          user_id: string | null
        }
        Relationships: []
      }
      view_monthly_summary: {
        Row: {
          debt_payments: number | null
          end_date: string | null
          future_actual: number | null
          future_assigned: number | null
          month_id: number | null
          month_name: string | null
          needs_actual: number | null
          needs_assigned: number | null
          net_cash_flow: number | null
          start_date: string | null
          total_expenses: number | null
          total_income: number | null
          user_id: string | null
          wants_actual: number | null
          wants_assigned: number | null
          wishlist_item_count: number | null
          wishlist_total_cost: number | null
        }
        Relationships: []
      }
      view_settings_all: {
        Row: {
          budget_mode: string | null
          carryover_prev_balance: number | null
          created_at: string | null
          id: string | null
          month_abbr: string | null
          month_id: number | null
          monthly_challenge: string | null
          unassigned_pool: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      view_transactions_all: {
        Row: {
          account_id: string | null
          amount: number | null
          category_id: string | null
          created_at: string | null
          currency_code: string | null
          date: string | null
          description: string | null
          direction: string | null
          id: string | null
          month_abbr: string | null
          month_id: number | null
          notes: string | null
          payment_method_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
      view_wishlist_all: {
        Row: {
          acquired: boolean | null
          category_id: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string | null
          item: string | null
          month_abbr: string | null
          month_id: number | null
          priority: string | null
          user_id: string | null
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
