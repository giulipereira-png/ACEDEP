import { sanitizeText, getSafeErrorMessage } from '../utils/security';

// Safe fetch wrapper for optional Supabase synchronizations
export async function fetchAthletesFromSupabase() {
  const env = (import.meta as any).env || {};
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) return [];

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/athletes?select=*`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Supabase fetch fallback handled:', getSafeErrorMessage(err));
    return [];
  }
}

// Safe save helper
export async function saveAthleteToSupabase(athleteData: {
  name: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  accessCode: string;
  birthDate: string;
}) {
  const env = (import.meta as any).env || {};
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) return false;

  const payload = {
    full_name: sanitizeText(athleteData.name, 120),
    guardian_name: sanitizeText(athleteData.guardianName, 120),
    disability_type: `Idade: ${athleteDateToAge(athleteData.birthDate)}`,
    swating_experience: 'Atleta cadastrado via Painel ADM',
    phone: sanitizeText(athleteData.guardianPhone, 30),
    email: sanitizeText(athleteData.guardianEmail, 120) || 'contato@acedep.org.br',
    status: 'Ativo'
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
      body: JSON.stringify(payload)
    });

    return response.ok;
  } catch (err) {
    console.warn('Supabase save error handled safely:', getSafeErrorMessage(err));
    return false;
  }
}

function athleteDateToAge(dateStr: string) {
  if (!dateStr) return 'N/I';
  const birth = new Date(dateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  return isNaN(age) ? 'N/I' : age.toString();
}
