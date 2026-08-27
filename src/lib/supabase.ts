// Configuração limpa do Supabase via nativo (Fetch)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
    throw new Error('As variáveis de ambiente do Supabase não estão configuradas.');
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
