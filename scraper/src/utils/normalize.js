const today = () => new Date().toISOString().slice(0, 10);

const PRODUCTS = [
  'Multi-Currency Accounts',
  'Corporate FX',
  'Cross-Border Payroll',
  'Payment Links',
  'Africa Collect & Remit',
  'Retail Remittances',
];

function inferProduct(text = '') {
  const t = text.toLowerCase();
  if (t.includes('payroll') || t.includes('salary') || t.includes('wage')) return 'Cross-Border Payroll';
  if (t.includes('remit') || t.includes('transfer') || t.includes('money transfer')) return 'Retail Remittances';
  if (t.includes('africa') || t.includes('kenya') || t.includes('nigeria') || t.includes('ghana')) return 'Africa Collect & Remit';
  if (t.includes('fx') || t.includes('foreign exchange') || t.includes('currency')) return 'Corporate FX';
  if (t.includes('payment link') || t.includes('checkout') || t.includes('invoice')) return 'Payment Links';
  return 'Multi-Currency Accounts';
}

function normalizeSize(raw = '') {
  const n = parseInt(raw.replace(/\D/g, '')) || 0;
  if (n <= 10)  return '1-10';
  if (n <= 50)  return '11-50';
  if (n <= 200) return '51-200';
  if (n <= 500) return '201-500';
  return '500+';
}

export function normalize(raw, source) {
  const searchText = [raw.company, raw.description, raw.category, raw.industry].join(' ');
  return {
    company:       (raw.company || '').trim(),
    contact:       (raw.contact || '').trim(),
    email:         (raw.email || '').trim(),
    phone:         (raw.phone || '').trim(),
    stage:         'New Lead',
    value:         0,
    product:       inferProduct(searchText),
    source,
    industry:      (raw.industry || raw.category || 'Fintech').trim(),
    size:          normalizeSize(raw.size || raw.employees || ''),
    notes:         (raw.description || raw.snippet || '').slice(0, 500).trim(),
    created:       today(),
    last_activity: today(),
  };
}
