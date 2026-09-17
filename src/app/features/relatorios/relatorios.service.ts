import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../core/supabase/supabase-client';
import { Tables } from '../../core/types/database.types';

@Injectable({ providedIn: 'root' })
export class RelatoriosService {
  private readonly supabase = inject(SUPABASE_CLIENT);

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
}
