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

  async getMovimentacoesPeriodo(startDate: string, endDate: string): Promise<Tables<'financial_transactions'>[]> {
    const { data, error } = await this.supabase
      .from('financial_transactions')
      .select('*')
      .neq('status', 'cancelado')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);
    if (error) throw error;
    return data ?? [];
  }

  async getFluxoCaixaPeriodo(
    startDate: string,
    endDate: string,
    financialAccountId?: string | null,
  ): Promise<Tables<'v_fluxo_caixa'>[]> {
    let query = this.supabase
      .from('v_fluxo_caixa')
      .select('*')
      .gte('data', startDate)
      .lte('data', endDate);
    if (financialAccountId) query = query.eq('financial_account_id', financialAccountId);
    const { data, error } = await query;
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

  async getUltimosCiclosComResultado(
    limite = 6,
  ): Promise<{ ciclo: Tables<'cycles'>; receita: number; despesa: number }[]> {
    const { data: ciclos, error: erroCiclos } = await this.supabase
      .from('cycles')
      .select('*')
      .order('start_date', { ascending: false })
      .limit(limite);
    if (erroCiclos) throw erroCiclos;
    if (!ciclos || ciclos.length === 0) return [];

    const ids = ciclos.map((c) => c.id);
    const { data: resultado, error: erroResultado } = await this.supabase
      .from('v_resultado_periodo')
      .select('*')
      .in('cycle_id', ids);
    if (erroResultado) throw erroResultado;

    return ciclos
      .map((ciclo) => {
        const linhas = (resultado ?? []).filter((r) => r.cycle_id === ciclo.id);
        return {
          ciclo,
          receita: linhas.filter((r) => r.type === 'income').reduce((s, r) => s + (r.amount ?? 0), 0),
          despesa: linhas.filter((r) => r.type === 'expense').reduce((s, r) => s + (r.amount ?? 0), 0),
        };
      })
      .reverse();
  }

  async getMovimentacoesRecentes(limite = 8): Promise<Tables<'financial_transactions'>[]> {
    const { data, error } = await this.supabase
      .from('financial_transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limite);
    if (error) throw error;
    return data ?? [];
  }
}
