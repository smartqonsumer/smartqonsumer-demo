// Static SEO audit of the exported site (out/), run after `npm run build`.
// Ported from the legacy site's scripts/seo-check.mjs and adapted to the Next.js
// export (trailing-slash URLs, generated robots.txt / sitemap.xml).
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'out');
const SITE_URL = 'https://smartqonsumer.com';

/** URL path → exported file, and whether search engines may index it. */
const PAGES = [
  { url: '/', file: 'index.html', indexable: true },
  { url: '/legal/confidentialite/', file: 'legal/confidentialite/index.html', indexable: false },
  { url: '/legal/mentions-legales/', file: 'legal/mentions-legales/index.html', indexable: false },
  { url: '/legal/rgpd/', file: 'legal/rgpd/index.html', indexable: false },
  { url: null, file: '404.html', indexable: false },
];

const failures = [];
const fail = (file, message) => failures.push(`${file}: ${message}`);
const all = (source, expression) => [...source.matchAll(expression)];
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i'))?.[1];
const metas = (html, key, name) =>
  all(html, /<meta\b[^>]*>/gi)
    .map((m) => m[0])
    .filter((tag) => attr(tag, key) === name)
    .map((tag) => attr(tag, 'content') ?? '');

if (!fs.existsSync(root)) {
  console.error('out/ introuvable : lancer `npm run build` avant.');
  process.exit(1);
}

const titles = new Map();
const descriptions = new Map();

for (const page of PAGES) {
  const { file } = page;
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const head = html.split('</head>')[0];

  const title = head.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim();
  const description = metas(head, 'name', 'description')[0];
  const robots = metas(head, 'name', 'robots');
  const canonicals = all(head, /<link\b[^>]*rel=["']canonical["'][^>]*>/gi).map((m) => attr(m[0], 'href'));

  if (!title) fail(file, 'title manquant');
  else if (title.length > 60) fail(file, `title trop long (${title.length} > 60)`);
  if (!description) fail(file, 'meta description manquante');
  else if (description.length < 50 || description.length > 160) fail(file, `meta description hors 50–160 caractères (${description.length})`);
  if (title) titles.set(title, [...(titles.get(title) ?? []), file]);
  if (description) descriptions.set(description, [...(descriptions.get(description) ?? []), file]);

  if (!/<html[^>]*\slang=["']fr["']/i.test(html)) fail(file, 'attribut lang="fr" absent');
  if (!/<meta\s+name=["']viewport["']/i.test(head)) fail(file, 'meta viewport absente');
  const h1 = all(html, /<h1[\s>]/gi).length;
  if (h1 !== 1) fail(file, `${h1} H1, attendu : 1`);
  if (/localhost|127\.0\.0\.1/i.test(html)) fail(file, 'référence localhost dans le document');

  if (robots.length > 1) fail(file, `${robots.length} balises meta robots contradictoires (${robots.join(' / ')})`);
  const noindex = robots.some((r) => r.toLowerCase().includes('noindex'));
  if (page.indexable && noindex) fail(file, 'page indexable marquée noindex');
  if (!page.indexable && !noindex) fail(file, 'page non indexable sans noindex');

  if (page.url) {
    const expected = `${SITE_URL}${page.url}`;
    if (canonicals.length !== 1 || canonicals[0] !== expected) fail(file, `canonical attendue ${expected}, trouvée ${canonicals.join(', ') || 'aucune'}`);
    const ogUrl = metas(head, 'property', 'og:url')[0];
    if (ogUrl !== expected) fail(file, `og:url attendue ${expected}, trouvée ${ogUrl ?? 'aucune'}`);
    for (const property of ['og:title', 'og:description', 'og:image', 'og:site_name', 'og:locale']) {
      if (!metas(head, 'property', property)[0]) fail(file, `${property} manquant`);
    }
    for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
      if (!metas(head, 'name', name)[0]) fail(file, `${name} manquant`);
    }
    const ogImage = metas(head, 'property', 'og:image')[0];
    if (ogImage && !ogImage.startsWith(SITE_URL)) fail(file, `og:image non absolue : ${ogImage}`);
    else if (ogImage && !fs.existsSync(path.join(root, ogImage.slice(SITE_URL.length)))) fail(file, `og:image introuvable : ${ogImage}`);
  } else if (canonicals.length) {
    fail(file, `une page d'erreur ne doit pas déclarer de canonical (${canonicals.join(', ')})`);
  }

  for (const match of all(html, /<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (attr(tag, 'alt') === undefined) fail(file, `image sans alt : ${tag.slice(0, 100)}`);
    if (!attr(tag, 'width') || !attr(tag, 'height')) fail(file, `image sans dimensions : ${attr(tag, 'src')}`);
  }

  const ids = new Set(all(html, /\sid=["']([^"']+)["']/gi).map((m) => m[1]));
  for (const match of all(html, /<a\b[^>]*\shref=["']([^"']+)["'][^>]*>/gi)) {
    const href = match[1];
    if (href.startsWith('#')) {
      if (href.length > 1 && !ids.has(href.slice(1))) fail(file, `ancre introuvable : ${href}`);
      continue;
    }
    if (/^(?:https?:|mailto:|tel:|javascript:)/i.test(href)) continue;
    const [target, anchor] = href.split('#');
    const resolved = path.join(root, target.split('?')[0]);
    const exists = fs.existsSync(path.join(resolved, 'index.html')) || (fs.existsSync(resolved) && fs.statSync(resolved).isFile());
    if (!exists) fail(file, `lien interne cassé : ${href}`);
    if (target.endsWith('/') === false && !path.extname(target)) fail(file, `lien interne sans slash final (redirection inutile) : ${href}`);
    if (anchor && exists && fs.statSync(resolved).isDirectory()) {
      const targetHtml = fs.readFileSync(path.join(resolved, 'index.html'), 'utf8');
      if (!new RegExp(`\\sid=["']${anchor}["']`).test(targetHtml)) fail(file, `ancre introuvable : ${href}`);
    }
  }

  for (const match of all(html, /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1]);
      if (data['@context'] !== 'https://schema.org') fail(file, 'JSON-LD sans @context schema.org');
    } catch (error) {
      fail(file, `JSON-LD invalide : ${error.message}`);
    }
  }
}

for (const [title, files] of titles) if (files.length > 1) fail(files.join(', '), `title dupliqué : « ${title} »`);
for (const [, files] of descriptions) {
  const indexed = files.filter((f) => PAGES.find((p) => p.file === f)?.indexable);
  if (files.length > 1 && indexed.length) fail(files.join(', '), 'meta description dupliquée avec une page indexable');
}

const robotsTxt = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
if (!robotsTxt.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) fail('robots.txt', 'référence au sitemap absente ou incorrecte');
if (/Disallow:\s*\/\s*$/m.test(robotsTxt)) fail('robots.txt', 'le site entier est bloqué (Disallow: /)');

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const locs = all(sitemap, /<loc>([^<]+)<\/loc>/g).map((m) => m[1]);
for (const page of PAGES.filter((p) => p.url)) {
  const url = `${SITE_URL}${page.url}`;
  if (page.indexable && !locs.includes(url)) fail('sitemap.xml', `page indexable absente : ${url}`);
  if (!page.indexable && locs.includes(url)) fail('sitemap.xml', `page noindex présente : ${url}`);
}

const htaccess = path.join(root, '.htaccess');
if (!fs.existsSync(htaccess)) fail('.htaccess', 'absent : ni page 404 ni redirections des anciennes URLs sur Apache');
else if (!/ErrorDocument 404 \/404\.html/.test(fs.readFileSync(htaccess, 'utf8'))) fail('.htaccess', 'ErrorDocument 404 manquant');

if (failures.length) {
  console.error(`Échec de l'audit SEO (${failures.length}) :\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(`Audit SEO réussi : ${PAGES.length} pages, robots.txt, sitemap.xml et .htaccess vérifiés.`);
