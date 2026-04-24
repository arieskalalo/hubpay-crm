import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';

const BASE = 'https://www.difc.ae';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function runDIFC() {
  logger.info('DIFC scraper starting');
  const results = [];

  try {
    // DIFC Fintech Hive — public member list
    const { data: html } = await axios.get(
      'https://fintechhive.difc.ae/cohort/',
      { headers: HEADERS, timeout: 20000 }
    );
    const $ = cheerio.load(html);

    // Try multiple selectors that DIFC uses for company cards
    const selectors = [
      '.company-card', '.member-card', '.cohort-item',
      '[class*="company"]', '[class*="member"]', 'article'
    ];

    let found = false;
    for (const sel of selectors) {
      const cards = $(sel);
      if (cards.length > 2) {
        cards.each((_, el) => {
          const name = $(el).find('h2,h3,h4,[class*="title"],[class*="name"]').first().text().trim();
          const desc = $(el).find('p,[class*="desc"]').first().text().trim();
          if (name && name.length > 2) {
            results.push({ company: name, description: desc, category: 'Fintech', industry: 'Fintech' });
          }
        });
        found = true;
        break;
      }
    }

    if (!found) {
      // Fallback: scrape DIFC main company directory
      await sleep(2000);
      const { data: dirHtml } = await axios.get(
        `${BASE}/business/companies/?sector=fintech`,
        { headers: HEADERS, timeout: 20000 }
      );
      const $d = cheerio.load(dirHtml);
      $d('.company-listing__item, .listing-item, [class*="company-item"]').each((_, el) => {
        const name = $d(el).find('h2,h3,h4,strong,[class*="name"]').first().text().trim();
        const desc = $d(el).find('p').first().text().trim();
        if (name) results.push({ company: name, description: desc, industry: 'Fintech' });
      });
    }

    logger.info(`DIFC: found ${results.length} companies`);
  } catch (err) {
    logger.warn(`DIFC scraper failed: ${err.message}`);
  }

  return results;
}
