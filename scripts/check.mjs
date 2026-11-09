import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const dist = build();
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const errors = [];
const warnings = [];
const requiredIds = ['menuButton','closeMenu','drawer','backdrop','prev','next','pageCounter','progress','toast','labPreview','checkLabel','checkPercent','checkTrack'];
const pageCount = (html.match(/<section\b/g) || []).length;
const navCount = (html.match(/class="nav-item"/g) || []).length;
if (pageCount !== 23 || navCount !== 23) errors.push(`Expected 23 pages/menu links: found ${pageCount}/${navCount}`);
for (const id of requiredIds) if (!html.includes(`id="${id}"`)) errors.push(`Missing DOM ID: ${id}`);
for (const file of readdirSync(join(root,'src','scripts'))) {
  if (file.endsWith('.js')) {
    const text = readFileSync(join(root,'src','scripts',file),'utf8');
    for (const match of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
      if (!existsSync(resolve(join(root,'src','scripts'),match[1]))) errors.push(`Missing JS module: ${file} -> ${match[1]}`);
    }
  }
}
const textSources = [join(dist,'index.html'),...readdirSync(join(dist,'assets','css')).map(x=>join(dist,'assets','css',x))];
for (const file of textSources) {
  const text = readFileSync(file,'utf8');
  const references = [...text.matchAll(/(?:\bsrc|\bhref)="([^"]+)"/g)].map(x=>x[1]);
  for (const found of text.matchAll(/url\(['"]?(\/[^'"\)]+)['"]?\)/g)) references.push(found[1]);
  for (const url of references) {
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    const actual = join(dist, decodeURIComponent(url).replace(/^\/+/g,''));
    if (!existsSync(actual) || !statSync(actual).isFile()) errors.push(`${file.split('/').pop()} -> ${url}`);
  }
}
for (const filename of ['EBP-Marca-Oficial.ai','Kit-Logotipos-EBP.zip']) {
  const file=join(dist,'downloads',filename);
  if (!existsSync(file) || statSync(file).size===0) errors.push('Original download not found: '+filename);
}
if (errors.length) { console.error('✗ Issues found:\n'+errors.join('\n')); process.exit(1); }
console.log(`✓ ${pageCount} páginas, ${navCount} entradas de menu, ${requiredIds.length} IDs, recursos e downloads verificados.`);
console.log('✓ Arquivos locais, CSS e imports JavaScript encontrados.');
