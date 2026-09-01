import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sanitizeText } from '../utils/security';

const env = (import.meta as any).env || {};
export const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://hgwgrjwxddaqawjcjpwo.supabase.co';
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnd2dyand4ZGRhcWF3amNqcHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTcxMDcsImV4cCI6MjEwMzQzMzEwN30.2pbUisIlEae4BHCww9qXvet3Q_mp6YeTcYY04kXKqDY';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface StoredDocument {
  collection: string;
  id: string;
  data: any;
  updated_at?: string;
}

/**
 * Carrega todos os documentos de uma coleção do Supabase (tabela acedep_store)
 */
export async function fetchCollectionFromSupabase<T>(collectionName: string): Promise<T[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('acedep_store')
      .select('id, data, updated_at')
      .eq('collection', collectionName);

    if (error) {
      console.warn(`[Supabase] Erro ou tabela acedep_store ainda não criada para coleção "${collectionName}":`, error.message);
      return null;
    }

    if (Array.isArray(data)) {
      return data.map((row) => ({
        ...row.data,
        id: row.id || (row.data && row.data.id),
      })) as T[];
    }
    return [];
  } catch (err) {
    console.warn(`[Supabase] Falha ao consultar coleção "${collectionName}":`, err);
    return null;
  }
}

/**
 * Salva ou atualiza um documento no Supabase (tabela acedep_store)
 */
export async function saveDocToSupabase(collectionName: string, id: string, docData: any): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const payload = {
      collection: collectionName,
      id: String(id),
      data: docData,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('acedep_store')
      .upsert(payload, { onConflict: 'collection,id' });

    if (error) {
      console.warn(`[Supabase] Erro ao salvar doc "${id}" na coleção "${collectionName}":`, error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn(`[Supabase] Falha ao gravar doc "${id}" na coleção "${collectionName}":`, err);
    return false;
  }
}

/**
 * Remove um documento do Supabase
 */
export async function deleteDocFromSupabase(collectionName: string, id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('acedep_store')
      .delete()
      .eq('collection', collectionName)
      .eq('id', String(id));

    if (error) {
      console.warn(`[Supabase] Erro ao remover doc "${id}" da coleção "${collectionName}":`, error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn(`[Supabase] Falha ao deletar doc "${id}" da coleção "${collectionName}":`, err);
    return false;
  }
}

/**
 * Cria ouvinte em tempo real no Supabase para sincronização instantânea entre celular e computador
 */
export function subscribeToSupabaseCollection<T>(
  collectionName: string,
  onUpdate: (items: T[]) => void
): () => void {
  if (!isSupabaseConfigured) return () => {};

  // Busca inicial
  fetchCollectionFromSupabase<T>(collectionName).then((items) => {
    if (items !== null) {
      onUpdate(items);
    }
  });

  // Canal Realtime do Supabase
  const channel = supabase
    .channel(`acedep_realtime_${collectionName}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'acedep_store',
        filter: `collection=eq.${collectionName}`,
      },
      () => {
        // Quando qualquer mudança acontecer (insert, update, delete), busca o estado atualizado
        fetchCollectionFromSupabase<T>(collectionName).then((items) => {
          if (items !== null) {
            onUpdate(items);
          }
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Helper para inserção de atletas no formulário público
 */
export async function insertAthlete(data: {
  full_name: string;
  guardian_name: string;
  disability_type: string;
  swating_experience: string;
  phone: string;
  email: string;
  status: string;
}) {
  const athleteId = 'ath_' + Date.now();
  const cleanData = {
    id: athleteId,
    name: sanitizeText(data.full_name, 120),
    guardian: sanitizeText(data.guardian_name, 120),
    disability: sanitizeText(data.disability_type, 100),
    classCategory: 'S14 / S21',
    phone: sanitizeText(data.phone, 30),
    email: sanitizeText(data.email, 120),
    status: sanitizeText(data.status, 30) || 'Ativo',
    createdAt: new Date().toISOString(),
  };

  return await saveDocToSupabase('athletes', athleteId, cleanData);
}
