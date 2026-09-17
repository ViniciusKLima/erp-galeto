export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          active: boolean
          created_at: string
          document: string | null
          id: string
          name: string
          phone: string | null
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          document?: string | null
          id?: string
          name: string
          phone?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          document?: string | null
          id?: string
          name?: string
          phone?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cycles: {
        Row: {
          closed_at: string | null
          created_at: string
          created_by: string
          end_date: string
          id: string
          label: string
          notes: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          created_by?: string
          end_date: string
          id?: string
          label: string
          notes?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          created_by?: string
          end_date?: string
          id?: string
          label?: string
          notes?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      debt_installments: {
        Row: {
          amount: number
          created_at: string
          debt_id: string
          due_date: string
          id: string
          notes: string | null
          number: number
          paid_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          debt_id: string
          due_date: string
          id?: string
          notes?: string | null
          number: number
          paid_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          debt_id?: string
          due_date?: string
          id?: string
          notes?: string | null
          number?: number
          paid_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      debts: {
        Row: {
          created_at: string
          created_by: string
          creditor_id: string
          description: string
          id: string
          notes: string | null
          start_date: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          creditor_id: string
          description: string
          id?: string
          notes?: string | null
          start_date: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          creditor_id?: string
          description?: string
          id?: string
          notes?: string | null
          start_date?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      financial_accounts: {
        Row: {
          active: boolean
          created_at: string
          id: string
          initial_balance: number
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          initial_balance?: number
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          initial_balance?: number
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category_id: string
          counterparty_id: string | null
          created_at: string
          created_by: string
          cycle_id: string | null
          description: string
          due_date: string | null
          id: string
          installments_total: number
          is_installment: boolean
          notes: string | null
          paid_amount: number
          paid_at: string | null
          payment_method_id: string
          status: string
          subcategory_id: string | null
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category_id: string
          counterparty_id?: string | null
          created_at?: string
          created_by?: string
          cycle_id?: string | null
          description: string
          due_date?: string | null
          id?: string
          installments_total?: number
          is_installment?: boolean
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_method_id: string
          status?: string
          subcategory_id?: string | null
          transaction_date: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string
          counterparty_id?: string | null
          created_at?: string
          created_by?: string
          cycle_id?: string | null
          description?: string
          due_date?: string | null
          id?: string
          installments_total?: number
          is_installment?: boolean
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_method_id?: string
          status?: string
          subcategory_id?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_transactions_audit: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          new_data: Json
          old_data: Json
          operation: string
          transaction_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data: Json
          old_data: Json
          operation: string
          transaction_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data?: Json
          old_data?: Json
          operation?: string
          transaction_id?: string
        }
        Relationships: []
      }
      installments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          installment_number: number
          notes: string | null
          paid_amount: number
          paid_at: string | null
          status: string
          total_installments: number
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          status?: string
          total_installments: number
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          status?: string
          total_installments?: number
          transaction_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          active: boolean
          consumption_quantity: number | null
          consumption_unit: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          purchase_cost: number | null
          purchase_quantity: number | null
          sale_value: number | null
          supplier_id: string | null
          unit: string
          updated_at: string
          yield: number | null
        }
        Insert: {
          active?: boolean
          consumption_quantity?: number | null
          consumption_unit?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          purchase_cost?: number | null
          purchase_quantity?: number | null
          sale_value?: number | null
          supplier_id?: string | null
          unit: string
          updated_at?: string
          yield?: number | null
        }
        Update: {
          active?: boolean
          consumption_quantity?: number | null
          consumption_unit?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          purchase_cost?: number | null
          purchase_quantity?: number | null
          sale_value?: number | null
          supplier_id?: string | null
          unit?: string
          updated_at?: string
          yield?: number | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      transaction_categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      transaction_settlements: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          financial_account_id: string
          id: string
          installment_id: string | null
          notes: string | null
          settled_at: string
          transaction_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string
          financial_account_id: string
          id?: string
          installment_id?: string | null
          notes?: string | null
          settled_at: string
          transaction_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          financial_account_id?: string
          id?: string
          installment_id?: string | null
          notes?: string | null
          settled_at?: string
          transaction_id?: string
        }
        Relationships: []
      }
      transaction_subcategories: {
        Row: {
          active: boolean
          category_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      transfers: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          destination_account_id: string
          id: string
          notes: string | null
          source_account_id: string
          transfer_date: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string
          destination_account_id: string
          id?: string
          notes?: string | null
          source_account_id: string
          transfer_date: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          destination_account_id?: string
          id?: string
          notes?: string | null
          source_account_id?: string
          transfer_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_contas_a_pagar: {
        Row: {
          counterparty_id: string | null
          cycle_id: string | null
          description: string | null
          installment_id: string | null
          status: string | null
          transaction_id: string | null
          valor_pendente: number | null
          vencimento: string | null
        }
        Relationships: []
      }
      v_contas_a_receber: {
        Row: {
          counterparty_id: string | null
          cycle_id: string | null
          description: string | null
          installment_id: string | null
          status: string | null
          transaction_id: string | null
          valor_pendente: number | null
          vencimento: string | null
        }
        Relationships: []
      }
      v_fluxo_caixa: {
        Row: {
          cycle_id: string | null
          data: string | null
          direcao: string | null
          financial_account_id: string | null
          valor: number | null
        }
        Relationships: []
      }
      v_movimentos_caixa: {
        Row: {
          cycle_id: string | null
          data: string | null
          direcao: string | null
          financial_account_id: string | null
          origem: string | null
          origem_id: string | null
          valor: number | null
        }
        Relationships: []
      }
      v_resultado_periodo: {
        Row: {
          amount: number | null
          category_id: string | null
          cycle_id: string | null
          data: string | null
          transaction_id: string | null
          type: string | null
        }
        Relationships: []
      }
      v_saldo_contas: {
        Row: {
          financial_account_id: string | null
          name: string | null
          saldo_atual: number | null
          type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cancelar_movimentacao: {
        Args: { p_motivo: string; p_transaction_id: string }
        Returns: undefined
      }
      criar_movimentacao_parcelada: {
        Args: {
          p_amount: number
          p_category_id: string
          p_counterparty_id: string
          p_cycle_id?: string
          p_description: string
          p_first_due_date: string
          p_installments_total: number
          p_notes: string
          p_payment_method_id: string
          p_subcategory_id: string
          p_transaction_date: string
          p_type: string
        }
        Returns: string
      }
      is_active_user: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      registrar_liquidacao: {
        Args: {
          p_amount: number
          p_financial_account_id: string
          p_installment_id: string | null
          p_notes?: string
          p_settled_at: string
          p_transaction_id: string
        }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])> =
  (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never

export type FunctionArgs<T extends keyof DefaultSchema["Functions"]> =
  DefaultSchema["Functions"][T]["Args"]
