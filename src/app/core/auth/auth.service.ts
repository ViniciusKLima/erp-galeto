import { Injectable, computed, inject, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase-client';
import { Tables } from '../types/database.types';

export type Profile = Tables<'profiles'>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SUPABASE_CLIENT);

  private readonly sessionSignal = signal<Session | null>(null);
  private readonly profileSignal = signal<Profile | null>(null);
  private readonly readySignal = signal(false);

  readonly session = this.sessionSignal.asReadonly();
  readonly profile = this.profileSignal.asReadonly();
  readonly ready = this.readySignal.asReadonly();

  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly isAdmin = computed(() => this.profileSignal()?.role === 'admin');
  readonly isActive = computed(() => this.profileSignal()?.active === true);

  constructor() {
    this.supabase.auth.getSession().then(({ data }) => {
      this.sessionSignal.set(data.session);
      this.loadProfile(data.session?.user.id).finally(() => this.readySignal.set(true));
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.sessionSignal.set(session);
      this.loadProfile(session?.user.id);
    });
  }

  private async loadProfile(userId: string | undefined): Promise<void> {
    if (!userId) {
      this.profileSignal.set(null);
      return;
    }
    const { data } = await this.supabase.from('profiles').select('*').eq('id', userId).single();
    this.profileSignal.set(data ?? null);
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}
