import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../core/supabase/supabase-client';
import { Tables } from '../../core/types/database.types';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly supabase = inject(SUPABASE_CLIENT);

  async getSaldoContas(): Promise<Tables<'v_saldo_contas'>[]> {
    const { data, error } = await this.supabase.from('v_saldo_contas').select('*').order('name');
    if (error) throw error;
    return data ?? [];
  }

  async getResultadoPeriodo(startDate: string, endDate: string): Promise<Tables<'v_resultado_periodo'>[]> {
    const { data, error } = await this.supabase
      .from('v_resultado_periodo')
      .select('*')
      .gte('data', startDate)
      .lte('data', endDate);
    if (error) throw error;
    return data ?? [];
  }

  async getContasAPagar(): Promise<Tables<'v_contas_a_pagar'>[]> {
    const { data, error } = await this.supabase.from('v_contas_a_pagar').select('*').order('vencimento');
    if (error) throw error;
    return data ?? [];
  }

  async getContasAReceber(): Promise<Tables<'v_contas_a_receber'>[]> {
    const { data, error } = await this.supabase.from('v_contas_a_receber').select('*').order('vencimento');
    if (error) throw error;
    return data ?? [];
  }

  async getCicloAtual(): Promise<Tables<'cycles'> | null> {
    const emAndamento = await this.supabase
      .from('cycles')
      .select('*')
      .in('status', ['aberto', 'em_andamento'])
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (emAndamento.error) throw emAndamento.error;
    if (emAndamento.data) return emAndamento.data;

    const maisRecente = await this.supabase
      .from('cycles')
      .select('*')
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (maisRecente.error) throw maisRecente.error;
    return maisRecente.data;
  }

  async getResultadoPorCiclo(cycleId: string): Promise<Tables<'v_resultado_periodo'>[]> {
    const { data, error } = await this.supabase.from('v_resultado_periodo').select('*').eq('cycle_id', cycleId);
    if (error) throw error;
    return data ?? [];
  }
}
