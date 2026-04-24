import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function runADGM() {
  logger.info('ADGM scraper starting');
  const results = [];

  try {
    // ADGM public entity register — financial services category
    const categories = ['Fintech', 'Payment Service Provider', 'Money Service Business'];

    for (const cat of categories) {
      await sleep(2000);
      const url = `https://www.adgm.com/register/entity-search?category=${encodeURIComponent(cat)}`;
      const { data: html } = await axios.get(url, { headers: HEADERS, timeout: 20000 });
      const $ = cheerio.load(html);

      // Try common table/card patterns for entity registers
      $('table tbody tr, .entity-row, .register-item, [class*="entity"]').each((_, el) => {
        const cells = $(el).find('td');
        const name = cells.first().text().trim() || $(el).find('[class*="name"],h3,h4').first().text().trim();
        const category = cells.eq(1).text().trim() || cat;
        if (name && name.length > 2 && !/name|entity|company/i.test(name)) {
          results.push({ company: name, category, industry: 'Financial Services / Fintech' });
        }
      });
    }

    logger.info(`ADGM: found ${results.length} entities`);
  } catch (err) {
    logger.warn(`ADGM scraper failed: ${err.message}`);
  }

  return results;
}
