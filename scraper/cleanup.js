/**
 * One-time cleanup: deletes all leads from Supabase that are not
 * relevant to HubPay's business (payments, FX, remittance, payroll).
 *
 * Runs via GitHub Actions → "Cleanup Irrelevant Leads" workflow.
 * Uses the same isHubpayRelevant() logic as the daily scraper.
 */
import { createClient } from '@supabase/supabase-js';
import { isHubpayRelevant } from './src/utils/normalize.js';

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function main() {
  // Fetch every lead
  const { data: leads, error } = await db
    .from('leads')
    .select('id, company, notes, industry, product, source');

  if (error) {
    console.error('Failed to fetch leads:', error.message);
    process.exit(1);
  }

  console.log(`Total leads in database: ${leads.length}`);

  const toDelete = [];
  const toKeep   = [];

  for (const lead of leads) {
    const searchText = [lead.company, lead.notes, lead.industry, lead.product, lead.source].join(' ');
    if (isHubpayRelevant(searchText)) {
      toKeep.push(lead);
    } else {
      toDelete.push(lead);
    }
  }

  console.log(`\nKeeping  (${toKeep.length}):`);
  toKeep.forEach(l => console.log(`  ✓ [${l.id}] ${l.company}`));

  console.log(`\nDeleting (${toDelete.length}):`);
  toDelete.forEach(l => console.log(`  ✗ [${l.id}] ${l.company}`));

  if (toDelete.length === 0) {
    console.log('\nNothing to delete — all leads are HubPay-relevant.');
    return;
  }

  const ids = toDelete.map(l => l.id);

  // Delete child activities first (foreign key constraint)
  const { error: actErr } = await db.from('activities').delete().in('lead_id', ids);
  if (actErr) { console.error('Failed to delete activities:', actErr.message); process.exit(1); }

  // Delete the leads
  const { error: delErr } = await db.from('leads').delete().in('id', ids);
  if (delErr) { console.error('Failed to delete leads:', delErr.message); process.exit(1); }

  console.log(`\nDone — deleted ${toDelete.length} irrelevant leads, kept ${toKeep.length}.`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
