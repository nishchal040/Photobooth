/**
 * Photobooth Studio - Programmatic SEO Generator
 * Generates static landing pages, JSON-LD schemas, sitemap.xml, and robots.txt
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'seo-pages.json');
const OUTPUT_DIR = path.join(ROOT_DIR, 'p');

if (!fs.existsSync(DATA_FILE)) {
  console.error(`Error: Data file not found at ${DATA_FILE}`);
  process.exit(1);
}

const rawData = fs.readFileSync(DATA_FILE, 'utf8');
const seoData = JSON.parse(rawData);

const site = seoData.siteMetadata || {
  siteName: "Photobooth Studio",
  siteUrl: "https://photobooth.app",
  defaultThemeColor: "#D4537E",
  author: "Photobooth Studio"
};

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log(`Starting Programmatic SEO Generation for ${seoData.pages.length} pages...`);

/**
 * Helper to build internal link cloud for related pages
 */
function renderRelatedLinks(currentPageSlug) {
  let html = '';
  
  seoData.categories.forEach(category => {
    const categoryPages = seoData.pages.filter(p => p.category === category.id);
    if (categoryPages.length === 0) return;

    html += `
      <div class="seo-category-group">
        <h3>${category.name}</h3>
        <div class="seo-pills-grid">
    `;

    categoryPages.forEach(p => {
      const isCurrent = p.slug === currentPageSlug;
      if (isCurrent) {
        html += `<span class="seo-pill current" aria-current="page">${p.badge || p.h1}</span>`;
      } else {
        html += `<a href="${p.slug}.html" class="seo-pill" title="${p.metaTitle}">${p.badge || p.h1}</a>`;
      }
    });

    html += `
        </div>
      </div>
    `;
  });

  return html;
}

/**
 * Helper to render structured JSON-LD schemas
 */
function buildJsonLd(page) {
  const pageUrl = `${site.siteUrl}/p/${page.slug}.html`;

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${page.h1} - ${site.siteName}`,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All Modern Web Browsers (iOS, Android, Windows, macOS, Linux, ChromeOS)",
    "description": page.metaDescription,
    "url": pageUrl,
    "browserRequirements": "Requires HTML5 Canvas and MediaDevices camera stream permissions.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${site.siteUrl}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": page.categoryName || "Styles & Occasions",
        "item": `${site.siteUrl}/#categories`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": page.h1,
        "item": pageUrl
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to Create ${page.h1} Photo Strips Online`,
    "description": `Step-by-step tutorial to create printable ${page.h1} photo strips directly inside your browser.`,
    "step": page.howTo.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "name": step.title,
      "text": step.text
    }))
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": page.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return JSON.stringify([webAppSchema, breadcrumbSchema, howToSchema, faqSchema], null, 2);
}

/**
 * Generate Individual Static HTML Page
 */
seoData.pages.forEach(page => {
  const pageUrl = `${site.siteUrl}/p/${page.slug}.html`;
  const themeColor = page.themeColor || site.defaultThemeColor;
  const jsonLd = buildJsonLd(page);

  const featuresHtml = page.features.map(f => `
    <div class="feature-item">
      <h3>✨ ${f.title}</h3>
      <p>${f.description}</p>
    </div>
  `).join('\n');

  const stepsHtml = page.howTo.map(s => `
    <div class="step-card">
      <div class="step-badge">${s.step}</div>
      <h3>${s.title}</h3>
      <p>${s.text}</p>
    </div>
  `).join('\n');

  const tipsHtml = (page.eventTips && page.eventTips.length > 0) ? `
    <div class="seo-tips-box">
      <h3>💡 Pro Ideas & Tips for ${page.badge || page.h1}</h3>
      <ul>
        ${page.eventTips.map(t => `<li>${t}</li>`).join('\n')}
      </ul>
    </div>
  ` : '';

  const faqsHtml = page.faqs.map(f => `
    <div class="faq-item">
      <button class="faq-item-question" type="button">
        <span>${f.question}</span>
        <span class="faq-icon" aria-hidden="true">+</span>
      </button>
      <div class="faq-item-answer">
        <p>${f.answer}</p>
      </div>
    </div>
  `).join('\n');

  const relatedLinksHtml = renderRelatedLinks(page.slug);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.metaTitle}</title>
    <meta name="description" content="${page.metaDescription}">
    <meta name="keywords" content="${page.keywords}">
    <meta name="author" content="${site.author}">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="${themeColor}">
    <link rel="canonical" href="${pageUrl}">

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${page.metaTitle}">
    <meta property="og:description" content="${page.metaDescription}">
    <meta property="og:image" content="../assets/logo.svg">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:site_name" content="${site.siteName}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${page.metaTitle}">
    <meta name="twitter:description" content="${page.metaDescription}">
    <meta name="twitter:image" content="../assets/logo.svg">

    <!-- Favicon Suite -->
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="alternate icon" href="../favicon.svg">
    <link rel="apple-touch-icon" href="../favicon.svg">
    <link rel="manifest" href="../site.webmanifest">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Chewy&family=Outfit:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="../style.css">

    <!-- Programmatic SEO Structured Data (JSON-LD) -->
    <script type="application/ld+json">
${jsonLd}
    </script>
</head>
<body>
    <div class="main">
        <!-- Breadcrumb Navigation -->
        <nav class="seo-breadcrumbs" aria-label="Breadcrumb">
            <a href="../index.html">Home</a>
            <span class="separator">/</span>
            <span>${page.categoryName || "Styles"}</span>
            <span class="separator">/</span>
            <span aria-current="page">${page.h1}</span>
        </nav>

        <!-- Main Application Header -->
        <header class="app-header">
            <div class="brand-container">
                <a href="../index.html" title="Back to Photobooth Home">
                    <img src="../assets/logo.svg" alt="Photobooth Studio Logo" class="brand-logo" width="44" height="44">
                </a>
                <div class="title-wrap">
                    <h1>${page.h1} <span class="badge" style="background: ${themeColor};">${page.badge}</span></h1>
                    <p class="subtitle">${page.subtitle}</p>
                </div>
            </div>
        </header>

        <main class="app-content">
            <!-- Studio Camera Section -->
            <section class="studio-section" aria-label="Photo Booth Camera Studio">
                <!-- Filter Bar Navigation -->
                <nav id="filters" aria-label="Photo Filter Selection">
                    <span class="filter-label">Filters:</span>
                    <button class="filter-btn active" data-filter="none" aria-label="Normal Filter">Normal</button>
                    <button class="filter-btn" data-filter="grayscale(1)" aria-label="Black and White Filter">B&W</button>
                    <button class="filter-btn" data-filter="sepia(1) contrast(1.1)" aria-label="Vintage Sepia Filter">Vintage</button>
                    <button class="filter-btn" data-filter="contrast(1.4) brightness(1.1)" aria-label="High Contrast Filter">Contrast</button>
                    <button class="filter-btn" data-filter="brightness(1.25) saturate(1.2)" aria-label="Bright Glow Filter">Bright</button>
                    <button class="filter-btn" data-filter="hue-rotate(90deg)" aria-label="Cyberpop Filter">Cyberpop</button>
                    <button class="filter-btn" data-filter="saturate(2) contrast(1.2)" aria-label="Vivid Warm Filter">Vivid</button>
                </nav>

                <!-- Main Studio Workspace Container -->
                <div class="container">
                    <!-- Photostrip Output Side -->
                    <aside class="photostrip-wrapper" aria-label="Captured Photo Strip">
                        <div class="photostrip-header">
                            <span class="strip-brand">📷 ${page.stripStamp}</span>
                            <span id="photo-count-badge" class="strip-count">0/3</span>
                        </div>
                        <div id="photos" class="photostrip-frame">
                            <div class="empty-placeholder">
                                <span>Press "Cheese!" to take your 1st photo</span>
                            </div>
                        </div>
                    </aside>

                    <!-- Camera Viewfinder Side -->
                    <article class="preview-card" aria-label="Camera Viewfinder">
                        <div class="video-wrapper">
                            <video id="camera" autoplay playsinline title="Live Camera Feed"></video>

                            <!-- Visual Overlay Elements -->
                            <div id="flash-overlay" class="flash-effect" aria-hidden="true"></div>
                            <div id="countdown-overlay" class="countdown-overlay hidden" aria-live="assertive">3</div>

                            <!-- Camera Error / Permission Fallback -->
                            <div id="camera-status" class="camera-status hidden">
                                <p id="camera-error-msg">Camera permissions required</p>
                                <button id="retry-camera-btn" class="btn-mini">Retry Camera</button>
                            </div>
                        </div>

                        <!-- Action Controls Toolbar -->
                        <div class="btns-toolbar">
                            <button id="flip-btn" class="flip-btn" aria-label="Flip Camera or Mirror Toggle" title="Flip Camera / Mirror">↺</button>
                            <button id="timer-toggle" class="btn-secondary" aria-label="Toggle 3-second countdown timer" title="Toggle 3s Timer">⏱️ <span id="timer-label">Off</span></button>
                            <button id="snap" class="btn-snap" aria-label="Capture Photo">Cheese!</button>
                            <button id="reset-btn" class="btn-secondary" aria-label="Clear and Retake Photos" title="Reset Photos">🔄 Retake</button>
                            <button id="download" class="btn-download" aria-label="Download Photo Strip PNG">💾 Download</button>
                        </div>
                        <canvas id="canvas" style="display:none;"></canvas>
                    </article>
                </div>
            </section>

            <!-- Programmatic SEO Contextual Content & Guides -->
            <article class="seo-article">
                <!-- Overview & Features -->
                <section class="seo-card">
                    <h2>📸 About ${page.h1}</h2>
                    <p class="lead">${page.intro}</p>
                    
                    <div class="seo-features-grid">
                        ${featuresHtml}
                    </div>

                    ${tipsHtml}
                </section>

                <!-- How It Works Section -->
                <section class="seo-card">
                    <h2>✨ How to Create Your ${page.h1} Strip</h2>
                    <div class="seo-steps-container">
                        ${stepsHtml}
                    </div>
                </section>

                <!-- Frequently Asked Questions (FAQ) Section -->
                <section class="seo-card">
                    <h2>❓ Frequently Asked Questions</h2>
                    <div class="seo-faq-section">
                        ${faqsHtml}
                    </div>
                </section>

                <!-- Internal Linking Hub Matrix -->
                <section class="seo-card seo-related-hub">
                    <h2>🌟 Explore More Photo Booth Styles & Occasions</h2>
                    <p>Discover our complete suite of free browser photobooths, vintage filters, and celebratory strip creators:</p>
                    ${relatedLinksHtml}
                </section>
            </article>
        </main>

        <!-- Footer Section -->
        <footer class="app-footer">
            <nav class="footer-nav" aria-label="Footer Navigation">
                <a href="../index.html">Home Studio</a>
                <a href="wedding-photobooth.html">Wedding Photo Booth</a>
                <a href="vintage-photobooth.html">Vintage Booth</a>
                <a href="korean-photobooth.html">Korean 4-Cut</a>
                <a href="free-online-webcam-photobooth.html">Free Webcam Booth</a>
                <a href="../sitemap.xml">Sitemap</a>
            </nav>
            <p>Photobooth Studio — Privacy-first browser application. Photos remain 100% local on your device.</p>
        </footer>
    </div>

    <!-- Page Specific Configuration -->
    <script>
        window.PHOTOBOOTH_CONFIG = {
            slug: "${page.slug}",
            defaultFilter: "${page.defaultFilter}",
            stripStamp: "${page.stripStamp}",
            themeColor: "${themeColor}"
        };
    </script>
    <script src="../script.js"></script>
</body>
</html>`;

  const outputPath = path.join(OUTPUT_DIR, `${page.slug}.html`);
  fs.writeFileSync(outputPath, htmlContent, 'utf8');
  console.log(`Generated: p/${page.slug}.html`);
});

/**
 * Generate Sitemap XML
 */
const todayIso = new Date().toISOString().split('T')[0];

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Home Studio -->
  <url>
    <loc>${site.siteUrl}/</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

seoData.pages.forEach(page => {
  sitemapXml += `  <!-- ${page.h1} -->
  <url>
    <loc>${site.siteUrl}/p/${page.slug}.html</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
});

sitemapXml += `</urlset>\n`;

const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
console.log(`Generated: sitemap.xml with ${seoData.pages.length + 1} URLs`);

/**
 * Generate Robots.txt
 */
const robotsTxt = `# Photobooth Studio Robots.txt
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${site.siteUrl}/sitemap.xml
`;

const robotsPath = path.join(ROOT_DIR, 'robots.txt');
fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
console.log(`Generated: robots.txt`);

console.log('✅ Programmatic SEO generation completed successfully!');
