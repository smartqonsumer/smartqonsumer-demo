import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'seo.config.json'), 'utf8'));
const failures = [];
const htmlFiles = ['index.html', '404.html', ...fs.readdirSync(path.join(root, 'legal')).filter(name => name.endsWith('.html')).map(name => `legal/${name}`)];

const fail = (file, message) => failures.push(`${file}: ${message}`);
const matches = (source, expression) => [...source.matchAll(expression)];
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i'))?.[1];

for (const file of htmlFiles) {
  const absolute = path.join(root, file);
  const html = fs.readFileSync(absolute, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim();
  const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)?.[1]?.toLowerCase();
  const h1Count = matches(html, /<h1(?:\s|>)/gi).length;
  const mainCount = matches(html, /<main(?:\s|>)/gi).length;

  if (!title) fail(file, 'title manquant');
  if (!description) fail(file, 'meta description manquante');
  if (h1Count !== 1) fail(file, `${h1Count} H1 détecté(s), attendu : 1`);
  if (mainCount !== 1) fail(file, `${mainCount} élément(s) main détecté(s), attendu : 1`);
  if (/localhost|127\.0\.0\.1/i.test(html)) fail(file, 'référence localhost dans le document');

  const pagePath = file === 'index.html' ? '/' : `/${file}`;
  if (config.indexablePages.includes(pagePath)) {
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
    if (robots?.includes('noindex')) fail(file, 'page indexable marquée noindex');
    if (!canonical?.startsWith(config.siteUrl)) fail(file, 'canonical absente ou hors domaine');
    for (const property of ['og:title', 'og:description', 'og:url', 'og:image', 'og:site_name']) {
      if (!html.includes(`property="${property}"`)) fail(file, `${property} manquant`);
    }
    for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
      if (!html.includes(`name="${name}"`)) fail(file, `${name} manquant`);
    }
  }
  if (config.noindexPages.includes(pagePath) && !robots?.includes('noindex')) fail(file, 'page privée/technique sans noindex');

  for (const match of matches(html, /<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (attr(tag, 'alt') === undefined) fail(file, `image sans alt : ${tag.slice(0, 100)}`);
    const src = attr(tag, 'src');
    if (src && !src.startsWith('data:') && (!attr(tag, 'width') || !attr(tag, 'height'))) fail(file, `dimensions absentes pour ${src}`);
  }

  const ids = new Set(matches(html, /\sid=["']([^"']+)["']/gi).map(match => match[1]));
  for (const match of matches(html, /<a\b[^>]*\shref=["']([^"']+)["'][^>]*>/gi)) {
    const href = match[1];
    if (href.startsWith('#') && href.length > 1 && !ids.has(href.slice(1))) fail(file, `ancre introuvable : ${href}`);
    if (/^(?:https?:|mailto:|tel:|#|javascript:)/i.test(href)) continue;
    const target = href.startsWith('/') ? path.join(root, href) : path.resolve(path.dirname(absolute), href.split('#')[0].split('?')[0]);
    if (!fs.existsSync(target)) fail(file, `lien interne introuvable : ${href}`);
  }

  for (const match of matches(html, /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { fail(file, `JSON-LD invalide : ${error.message}`); }
  }
}

const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${config.siteUrl}/sitemap.xml`)) fail('robots.txt', 'référence sitemap absente ou incorrecte');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const page of config.indexablePages) {
  const url = `${config.siteUrl}${page}`;
  if (!sitemap.includes(`<loc>${url}</loc>`)) fail('sitemap.xml', `URL indexable absente : ${url}`);
}
for (const page of config.noindexPages) {
  if (sitemap.includes(`<loc>${config.siteUrl}${page}</loc>`)) fail('sitemap.xml', `URL noindex présente : ${page}`);
}

if (failures.length) {
  console.error(`Échec de l'audit SEO statique (${failures.length}) :\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Audit SEO statique réussi : ${htmlFiles.length} fichiers HTML vérifiés.`);
