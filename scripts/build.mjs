import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = join(projectRoot, 'src');
const output = join(projectRoot, 'dist');

const read = path => readFileSync(path, 'utf8');

/** Build one single, SEO-friendly HTML document from unchanged page fragments. */
export function renderHtml() {
  const pageDirectory = join(source, 'pages');
  const pages = readdirSync(pageDirectory)
    .filter(filename => /^\d{2}-.*\.html$/.test(filename))
    .sort((a, b) => a.localeCompare(b, 'en'));
  if (pages.length !== 23) throw new Error(`Expected 23 original pages; found ${pages.length}.`);
  const html = read(join(source, 'templates', 'index.html'));
  const variables = {
    VISUAL_FILTERS: read(join(source, 'components', 'visual-filters.html')),
    NAVIGATION: read(join(source, 'components', 'navigation.html')),
    PAGES: pages.map(page => read(join(pageDirectory, page))).join('\n'),
    CONTROLS: read(join(source, 'components', 'controls.html')),
  };
  const rendered = html.replace(/\{\{(VISUAL_FILTERS|NAVIGATION|PAGES|CONTROLS)\}\}/g, (_, key) => variables[key]);
  if ((rendered.match(/<section\b/g) || []).length !== 23) throw new Error('Incorrect number of sections.');
  return rendered;
}

/** Zero-dependency static build: works offline on Windows, macOS and Linux. */
export function build() {
  const page = renderHtml();
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });
  cpSync(join(projectRoot, 'public'), output, { recursive: true });
  mkdirSync(join(output, 'assets', 'css'), { recursive: true });
  mkdirSync(join(output, 'assets', 'js'), { recursive: true });
  for (const filename of readdirSync(join(source, 'styles'))) {
    if (filename.endsWith('.css')) cpSync(join(source, 'styles', filename), join(output, 'assets', 'css', filename));
  }
  for (const filename of readdirSync(join(source, 'scripts'))) {
    if (filename.endsWith('.js')) cpSync(join(source, 'scripts', filename), join(output, 'assets', 'js', filename));
  }
  writeFileSync(join(output, 'index.html'), page, 'utf8');
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dest = build();
  console.log(`✓ Projeto compilado em ${dest}`);
}
