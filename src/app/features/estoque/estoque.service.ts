import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../core/supabase/supabase-client';
import { Tables, TablesInsert, TablesUpdate } from '../../core/types/database.types';

export const UNIDADES_ESTOQUE = ['un', 'kg', 'g', 'L', 'mL', 'pct', 'cx', 'fd'] as const;

@Injectable({ providedIn: 'root' })
export class EstoqueService {
  private readonly supabase = inject(SUPABASE_CLIENT);

  async listar(): Promise<Tables<'inventory_items'>[]> {
    const { data, error } = await this.supabase.from('inventory_items').select('*').order('name');
    if (error) throw error;
    return data ?? [];
  }

  async criar(input: TablesInsert<'inventory_items'>): Promise<void> {
    const { error } = await this.supabase.from('inventory_items').insert(input);
    if (error) throw error;
  }

  async atualizar(id: string, input: TablesUpdate<'inventory_items'>): Promise<void> {
    const { error } = await this.supabase.from('inventory_items').update(input).eq('id', id);
    if (error) throw error;
  }

  async listarFornecedores(): Promise<Tables<'contacts'>[]> {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*')
      .eq('active', true)
      .in('type', ['fornecedor', 'outro'])
      .order('name');
    if (error) throw error;
    return data ?? [];
  }
}
