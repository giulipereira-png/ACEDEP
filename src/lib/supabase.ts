// Configuração unificada do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY;

// Objeto simulado de compatibilidade para auth e requisições simples
export const supabase = {
  auth: {
    async getSession() {
      return { data: { session: null } };
    },
    async signInWithPassword({ email, password }: any) {
      const res = await fetch(`${supabaseUrl}/rest/v1/admins?email=eq.${email}&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return { data: { session: { user: { email } } }, error: null };
      }
      return { data: { session: null }, error: { message: 'Não autorizado' } };
    },
    async signOut() {
      return { error: null };
    }
  }
};

export async function insertAthlete(data: {
  full_name: string;
  guardian_name: string;
  disability_type: string;
  swating_experience: string;
  phone: string;
  email: string;
  status: string;
}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('As chaves do Supabase não foram encontradas.');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/athletes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erro ao salvar no banco de dados.');
  }

  return true;
}
