import { db } from '../supabase.js';

export async function getExistingCompanies() {
  const { data, error } = await db.from('leads').select('company');
  if (error) throw new Error(`Failed to fetch existing leads: ${error.message}`);
  return new Set((data || []).map(r => r.company.toLowerCase().trim()));
}

export function isDuplicate(company, existingSet) {
  return existingSet.has(company.toLowerCase().trim());
}
