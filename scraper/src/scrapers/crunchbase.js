import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.google.com/',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Search queries targeting UAE fintech companies
const SEARCHES = [
  'UAE fintech startup 2025',
  'Dubai payment company',
  'Abu Dhabi financial technology',
  'MENA remittance company',
  'UAE cross-border payments',
];

async function searchDuckDuckGo(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' site:crunchbase.com/organization')}`;
  const { data: html } = await axios.get(url, { headers: HEADERS, timeout: 20000 });
  const $ = cheerio.load(html);
  const results = [];

  $('.result__title a, .result a[href*="crunchbase.com/organization"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const title = $(el).text().trim();
    // Extract company name from crunchbase URL or title
    const match = href.match(/organization\/([^/?&]+)/);
    if (match) {
      const slug = match[1];
      const name = title.replace(/\s*[-|]\s*Crunchbase.*$/i, '').trim() || slug.replace(/-/g, ' ');
      if (name.length > 2) results.push({ company: name, industry: 'Fintech', description: '' });
    }
  });

  return results;
}

export async function runCrunchbase() {
  logger.info('Crunchbase scraper starting');
  const results = [];

  for (const query of SEARCHES) {
    try {
      await sleep(3000); // be respectful with rate limiting
      const found = await searchDuckDuckGo(query);
      results.push(...found);
      logger.info(`Crunchbase search "${query}": found ${found.length} results`);
    } catch (err) {
      logger.warn(`Crunchbase search failed for "${query}": ${err.message}`);
    }
  }

  logger.info(`Crunchbase scraper total: ${results.length} leads`);
  return results;
}
