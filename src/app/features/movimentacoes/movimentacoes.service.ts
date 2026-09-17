import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../core/supabase/supabase-client';
import { FunctionArgs, Tables, TablesInsert } from '../../core/types/database.types';

export type MovimentacaoFiltro = {
  tipo?: 'income' | 'expense';
  status?: string;
  categoriaId?: string;
  cicloId?: string;
  dataInicio?: string;
  dataFim?: string;
};

@Injectable({ providedIn: 'root' })
export class MovimentacoesService {
  private readonly supabase = inject(SUPABASE_CLIENT);

  async listar(filtro: MovimentacaoFiltro = {}): Promise<Tables<'financial_transactions'>[]> {
    let query = this.supabase
      .from('financial_transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (filtro.tipo) query = query.eq('type', filtro.tipo);
    if (filtro.status) query = query.eq('status', filtro.status);
    if (filtro.categoriaId) query = query.eq('category_id', filtro.categoriaId);
    if (filtro.cicloId) query = query.eq('cycle_id', filtro.cicloId);
    if (filtro.dataInicio) query = query.gte('transaction_date', filtro.dataInicio);
    if (filtro.dataFim) query = query.lte('transaction_date', filtro.dataFim);

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  async listarParcelas(transactionId: string): Promise<Tables<'installments'>[]> {
    const { data, error } = await this.supabase
      .from('installments')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('installment_number');
    if (error) throw error;
    return data ?? [];
  }

  async criarSimples(input: TablesInsert<'financial_transactions'>): Promise<Tables<'financial_transactions'>> {
    const { data, error } = await this.supabase.from('financial_transactions').insert(input).select().single();
    if (error) throw error;
    return data;
  }

  async criarParcelada(args: FunctionArgs<'criar_movimentacao_parcelada'>): Promise<string> {
    const { data, error } = await this.supabase.rpc('criar_movimentacao_parcelada', args);
    if (error) throw error;
    return data as string;
  }

  async registrarLiquidacao(args: FunctionArgs<'registrar_liquidacao'>): Promise<string> {
    const { data, error } = await this.supabase.rpc('registrar_liquidacao', args);
    if (error) throw error;
    return data as string;
  }

  async cancelar(transactionId: string, motivo: string): Promise<void> {
    const { error } = await this.supabase.rpc('cancelar_movimentacao', {
      p_transaction_id: transactionId,
      p_motivo: motivo,
    });
    if (error) throw error;
  }

  // catálogos de apoio para formulários
  async listarCategorias(tipo?: 'income' | 'expense'): Promise<Tables<'transaction_categories'>[]> {
    let query = this.supabase.from('transaction_categories').select('*').eq('active', true).order('name');
    if (tipo) query = query.eq('type', tipo);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  async listarSubcategorias(categoriaId: string): Promise<Tables<'transaction_subcategories'>[]> {
    const { data, error } = await this.supabase
      .from('transaction_subcategories')
      .select('*')
      .eq('category_id', categoriaId)
      .eq('active', true)
      .order('name');
    if (error) throw error;
    return data ?? [];
  }

  async listarContasFinanceiras(): Promise<Tables<'financial_accounts'>[]> {
    const { data, error } = await this.supabase
      .from('financial_accounts')
      .select('*')
      .eq('active', true)
      .order('name');
    if (error) throw error;
    return data ?? [];
  }

  async listarFormasPagamento(): Promise<Tables<'payment_methods'>[]> {
    const { data, error } = await this.supabase
      .from('payment_methods')
      .select('*')
      .eq('active', true)
      .order('name');
    if (error) throw error;
    return data ?? [];
  }

  async listarContatos(): Promise<Tables<'contacts'>[]> {
    const { data, error } = await this.supabase.from('contacts').select('*').eq('active', true).order('name');
    if (error) throw error;
    return data ?? [];
  }

  async listarCiclos(): Promise<Tables<'cycles'>[]> {
    const { data, error } = await this.supabase.from('cycles').select('*').order('start_date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
}
