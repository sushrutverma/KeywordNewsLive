import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const publicDir = path.resolve(rootDir, 'public');

// Resolve SITE_URL
const rawSiteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://keywordnews.live';
const siteUrl = rawSiteUrl.replace(/\/+$/, '');
const currentDate = new Date().toISOString().split('T')[0];

console.log(`[SEO Build] Generating crawlability assets with SITE_URL: ${siteUrl}`);

// 1. Generate Sitemap
const publicRoutes = [
  { path: '/', changefreq: 'hourly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/terms', changefreq: 'yearly', priority: '0.5' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.5' },
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.path === '/' ? '/' : route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

// 2. Generate robots.txt
const robotsTxt = `# User-agent rules for Keyword News
User-agent: *
Allow: /
Disallow: /login
Disallow: /signup
Disallow: /onboarding
Disallow: /saved
Disallow: /settings

# Canonical Sitemap
Sitemap: ${siteUrl}/sitemap.xml
`;

// Write to public/ and dist/ if dist exists
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);

if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt);

  // 3. Prerender HTML shells for static public routes
  const templatePath = path.join(distDir, 'index.html');
  if (fs.existsSync(templatePath)) {
    const templateHtml = fs.readFileSync(templatePath, 'utf8');

    const routeMetadata = [
      {
        path: '/about',
        title: 'About Keyword – Driven by you, Curated for you',
        description: 'Learn about Keyword, the transparent real-time AI news aggregator and market intelligence reader.',
        robots: 'index, follow',
      },
      {
        path: '/contact',
        title: 'Contact Keyword – Editorial & Support',
        description: 'Get in touch with the Keyword team for editorial corrections, partnership inquiries, and platform support.',
        robots: 'index, follow',
      },
      {
        path: '/terms',
        title: 'Terms of Service | Keyword',
        description: 'Terms of Service, acceptable usage policies, and syndication guidelines for Keyword.',
        robots: 'index, follow',
      },
      {
        path: '/privacy',
        title: 'Privacy Policy | Keyword',
        description: 'Privacy Policy, data handling practices, and user privacy guarantees at Keyword.',
        robots: 'index, follow',
      },
    ];

    routeMetadata.forEach((route) => {
      const targetDir = path.join(distDir, route.path);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      let routeHtml = templateHtml;
      // Replace Title
      routeHtml = routeHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${route.title}</title>`);
      
      // Replace or inject description
      if (routeHtml.includes('<meta name="description"')) {
        routeHtml = routeHtml.replace(/<meta name="description" content="[\s\S]*?" \/>/, `<meta name="description" content="${route.description}" />`);
      }

      // Replace or inject canonical
      if (routeHtml.includes('<link rel="canonical"')) {
        routeHtml = routeHtml.replace(/<link rel="canonical" href="[\s\S]*?" \/>/, `<link rel="canonical" href="${siteUrl}${route.path}" />`);
      } else if (routeHtml.includes('</head>')) {
        routeHtml = routeHtml.replace('</head>', `  <link rel="canonical" href="${siteUrl}${route.path}" />\n</head>`);
      }

      // Replace or inject robots
      if (routeHtml.includes('<meta name="robots"')) {
        routeHtml = routeHtml.replace(/<meta name="robots" content="[\s\S]*?" \/>/, `<meta name="robots" content="${route.robots}" />`);
      } else if (routeHtml.includes('</head>')) {
        routeHtml = routeHtml.replace('</head>', `  <meta name="robots" content="${route.robots}" />\n</head>`);
      }

      fs.writeFileSync(path.join(targetDir, 'index.html'), routeHtml);
      console.log(`[SEO Prerender] Prerendered HTML shell for ${route.path}`);
    });
  }
}

console.log('[SEO Build] Sitemap, robots.txt, and prerender shells generated successfully.');
