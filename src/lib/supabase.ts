// Configuração limpa e direta do Supabase para o Admin
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY;

export const supabase = {
  auth: {
    async getSession() {
      // Verifica se há um admin salvo no navegador para manter a sessão ativa
      const savedAdmin = localStorage.getItem('acedep_admin_logged');
      if (savedAdmin) {
        return { data: { session: { user: { email: savedAdmin } } } };
      }
      return { data: { session: null } };
    },
    async signInWithPassword({ email }: any) {
      try {
        // Consulta direta na tabela 'admins' que criamos no Supabase
        const res = await fetch(`${supabaseUrl}/rest/v1/admins?email=eq.${email.trim()}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        });
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          // Salva localmente para manter logado
          localStorage.setItem('acedep_admin_logged', email.trim());
          return { data: { session: { user: { email } } }, error: null };
        }
        
        return { data: { session: null }, error: { message: 'E-mail não autorizado como administrador.' } };
      } catch (err) {
        return { data: { session: null }, error: { message: 'Erro de conexão com o banco de dados.' } };
      }
    },
    async signOut() {
      localStorage.removeItem('acedep_admin_logged');
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
