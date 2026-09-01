import { sanitizeText, getSafeErrorMessage } from '../utils/security';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = {
  auth: {
    async getSession() {
      try {
        const savedAdmin = localStorage.getItem('acedep_admin_profile');
        if (savedAdmin) {
          const parsed = JSON.parse(savedAdmin);
          return { data: { session: { user: { email: parsed.email } } } };
        }
      } catch {}
      return { data: { session: null } };
    },
    async signInWithPassword({ email, password }: { email?: string; password?: string }) {
      const cleanEmail = sanitizeText(email, 120).toLowerCase();
      if (!cleanEmail) {
        return { data: { session: null }, error: { message: 'Por favor informe um e-mail válido.' } };
      }

      if (!supabaseUrl || !supabaseAnonKey) {
        return { data: { session: null }, error: { message: 'Serviço de autenticação externo não configurado.' } };
      }

      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/admins?email=eq.${encodeURIComponent(cleanEmail)}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        });
        
        if (!res.ok) {
          return { data: { session: null }, error: { message: 'Credenciais inválidas.' } };
        }

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return { data: { session: { user: { email: cleanEmail } } }, error: null };
        }
        
        return { data: { session: null }, error: { message: 'E-mail não autorizado como administrador.' } };
      } catch (err) {
        return { data: { session: null }, error: { message: getSafeErrorMessage(err) } };
      }
    },
    async signOut() {
      try {
        localStorage.removeItem('acedep_admin_logged');
      } catch {}
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
    return false;
  }

  const cleanData = {
    full_name: sanitizeText(data.full_name, 120),
    guardian_name: sanitizeText(data.guardian_name, 120),
    disability_type: sanitizeText(data.disability_type, 100),
    swating_experience: sanitizeText(data.swating_experience, 100),
    phone: sanitizeText(data.phone, 30),
    email: sanitizeText(data.email, 120),
    status: sanitizeText(data.status, 30) || 'Ativo',
  };

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/athletes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(cleanData)
    });

    return response.ok;
  } catch (err) {
    console.warn('Supabase optional insert fallback handled safely:', getSafeErrorMessage(err));
    return false;
  }
}
