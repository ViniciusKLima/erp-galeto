import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../core/supabase/supabase-client';
import { FunctionArgs, Tables } from '../../core/types/database.types';

@Injectable({ providedIn: 'root' })
export class DividasService {
  private readonly supabase = inject(SUPABASE_CLIENT);

  async listar(): Promise<Tables<'debts'>[]> {
    const { data, error } = await this.supabase.from('debts').select('*').order('start_date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async listarParcelas(debtId: string): Promise<Tables<'debt_installments'>[]> {
    const { data, error } = await this.supabase
      .from('debt_installments')
      .select('*')
      .eq('debt_id', debtId)
      .order('number');
    if (error) throw error;
    return data ?? [];
  }

  async criarDividaParcelada(args: FunctionArgs<'criar_divida_parcelada'>): Promise<string> {
    const { data, error } = await this.supabase.rpc('criar_divida_parcelada', args);
    if (error) throw error;
    return data as string;
  }

  async registrarPagamento(debtInstallmentId: string, paidAt: string): Promise<void> {
    const { error } = await this.supabase.rpc('registrar_pagamento_divida', {
      p_debt_installment_id: debtInstallmentId,
      p_paid_at: paidAt,
    });
    if (error) throw error;
  }

  async listarCredores(): Promise<Tables<'contacts'>[]> {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*')
      .eq('active', true)
      .in('type', ['credor', 'fornecedor', 'outro'])
      .order('name');
    if (error) throw error;
    return data ?? [];
  }
}
