import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../core/supabase/supabase-client';
import { Tables, TablesInsert, TablesUpdate } from '../../core/types/database.types';

@Injectable({ providedIn: 'root' })
export class ConfiguracoesService {
  private readonly supabase = inject(SUPABASE_CLIENT);

  // categorias
  async listarCategorias(): Promise<Tables<'transaction_categories'>[]> {
    const { data, error } = await this.supabase
      .from('transaction_categories')
      .select('*')
      .order('type')
      .order('name');
    if (error) throw error;
    return data ?? [];
  }

  async criarCategoria(input: TablesInsert<'transaction_categories'>): Promise<void> {
    const { error } = await this.supabase.from('transaction_categories').insert(input);
    if (error) throw error;
  }

  async atualizarCategoria(id: string, input: TablesUpdate<'transaction_categories'>): Promise<void> {
    const { error } = await this.supabase.from('transaction_categories').update(input).eq('id', id);
    if (error) throw error;
  }

  // subcategorias
  async listarSubcategorias(): Promise<Tables<'transaction_subcategories'>[]> {
    const { data, error } = await this.supabase.from('transaction_subcategories').select('*').order('name');
    if (error) throw error;
    return data ?? [];
  }

  async criarSubcategoria(input: TablesInsert<'transaction_subcategories'>): Promise<void> {
    const { error } = await this.supabase.from('transaction_subcategories').insert(input);
    if (error) throw error;
  }

  async atualizarSubcategoria(id: string, input: TablesUpdate<'transaction_subcategories'>): Promise<void> {
    const { error } = await this.supabase.from('transaction_subcategories').update(input).eq('id', id);
    if (error) throw error;
  }

  // contas financeiras
  async listarContas(): Promise<Tables<'financial_accounts'>[]> {
    const { data, error } = await this.supabase.from('financial_accounts').select('*').order('name');
    if (error) throw error;
    return data ?? [];
  }

  async criarConta(input: TablesInsert<'financial_accounts'>): Promise<void> {
    const { error } = await this.supabase.from('financial_accounts').insert(input);
    if (error) throw error;
  }

  async atualizarConta(id: string, input: TablesUpdate<'financial_accounts'>): Promise<void> {
    const { error } = await this.supabase.from('financial_accounts').update(input).eq('id', id);
    if (error) throw error;
  }

  // formas de pagamento
  async listarFormasPagamento(): Promise<Tables<'payment_methods'>[]> {
    const { data, error } = await this.supabase.from('payment_methods').select('*').order('name');
    if (error) throw error;
    return data ?? [];
  }

  async criarFormaPagamento(input: TablesInsert<'payment_methods'>): Promise<void> {
    const { error } = await this.supabase.from('payment_methods').insert(input);
    if (error) throw error;
  }

  async atualizarFormaPagamento(id: string, input: TablesUpdate<'payment_methods'>): Promise<void> {
    const { error } = await this.supabase.from('payment_methods').update(input).eq('id', id);
    if (error) throw error;
  }

  // ciclos
  async listarCiclos(): Promise<Tables<'cycles'>[]> {
    const { data, error } = await this.supabase.from('cycles').select('*').order('start_date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async criarCiclo(input: TablesInsert<'cycles'>): Promise<void> {
    const { error } = await this.supabase.from('cycles').insert(input);
    if (error) throw error;
  }

  async atualizarStatusCiclo(id: string, status: string): Promise<void> {
    const { error } = await this.supabase.from('cycles').update({ status }).eq('id', id);
    if (error) throw error;
  }
}
