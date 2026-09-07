/**
 * Validation Script for Programmatic SEO Files
 */
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'seo-pages.json'), 'utf8'));

let errors = 0;
console.log('Validating 20 programmatic SEO landing pages...');

data.pages.forEach(p => {
  const filePath = path.join(__dirname, '..', 'p', p.slug + '.html');
  if (!fs.existsSync(filePath)) {
    console.error('Missing file:', filePath);
    errors++;
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');

  // Validate JSON-LD
  const match = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) {
    console.error('Missing JSON-LD script block in', filePath);
    errors++;
  } else {
    try {
      const parsed = JSON.parse(match[1]);
      if (!Array.isArray(parsed) || parsed.length < 4) {
        console.error('Unexpected JSON-LD structure in', filePath);
        errors++;
      }
    } catch(e) {
      console.error('Invalid JSON-LD syntax in', filePath, e.message);
      errors++;
    }
  }

  // Check critical markup
  if (!content.includes(p.h1)) {
    console.error('Missing H1 heading in', filePath);
    errors++;
  }
  if (!content.includes('window.PHOTOBOOTH_CONFIG')) {
    console.error('Missing PHOTOBOOTH_CONFIG in', filePath);
    errors++;
  }
  if (!content.includes('faq-item')) {
    console.error('Missing FAQ items in', filePath);
    errors++;
  }
});

console.log('Validating sitemap.xml...');
const sitemap = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');
if (!sitemap.includes('<urlset') || !sitemap.includes('wedding-photobooth.html')) {
  console.error('Sitemap check failed');
  errors++;
}

console.log('Validating robots.txt...');
const robots = fs.readFileSync(path.join(__dirname, '..', 'robots.txt'), 'utf8');
if (!robots.includes('Sitemap: https://photobooth.app/sitemap.xml')) {
  console.error('Robots.txt check failed');
  errors++;
}

if (errors === 0) {
  console.log(`✅ All 20 programmatic pages, structured JSON-LD schemas, sitemap.xml, and robots.txt verified successfully!`);
} else {
  console.error(`❌ Validation failed with ${errors} errors.`);
  process.exit(1);
}
