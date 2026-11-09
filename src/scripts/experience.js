/**
 * EletroBidu Partners — movimentos do manual e grade cinética da capa.
 * Substitua: src/scripts/experience.js
 * Sem React, Tailwind ou pacotes externos; estilos complementares em 08-direcao-de-arte.css.
 * Paleta utilizada no efeito: #0D0D3F, #211FA7, #1E3D8B e #FFFFFF.
 */

function initKineticCover(reducedMotion) {
  const cover = document.querySelector('#s01.page.cover, .page.cover');
  if (!cover || cover.querySelector('.ebp-kinetic-grid')) return;

  // O canvas e seus estilos são criados aqui para que esta atualização
  // exija a substituição de UM ÚNICO ARQUIVO JS.
  const style = document.createElement('style');
  style.id = 'ebp-kinetic-cover-style';
  style.textContent = `
    .page.cover {
      background: radial-gradient(ellipse 60% 64% at 14% 8%, rgba(30,61,139,.70), transparent 83%), radial-gradient(ellipse 55% 80% at 90% 66%, rgba(33,31,167,.34), transparent 78%), linear-gradient(125deg, #0D0D3F 8%, #1E3D8B 45%, #0D0D3F 90%) !important;
      background-size: 145% 145%, 155% 155%, 165% 165% !important;
      animation: ebp-aurora-flow 26s ease-in-out infinite alternate;
      isolation: isolate;
    }
    .page.cover .cover-photo { display: none !important; }
    .page.cover::after { display: none !important; }
    .page.cover > .ebp-kinetic-grid {
      position: absolute;
      inset: 0;
      z-index: 0;
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
      user-select: none;
    }
    .page.cover > .page-inner {
      position: relative;
      z-index: 1;
      background: transparent;
    }
    @media print {
      .page.cover > .ebp-kinetic-grid { display: none !important; }
    }
  `;
  document.head.appendChild(style);

  const canvas = document.createElement('canvas');
  canvas.className = 'ebp-kinetic-grid';
  canvas.setAttribute('aria-hidden', 'true');
  cover.prepend(canvas);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const REDUCED = reducedMotion.matches;
  const CELL = 60;
  const RADIUS = 265;
  const MAX_WARP = 27;
  const WAVE_SPEED = 410;
  const WAVE_WIDTH = 54;
  const SMOOTHING = 0.11;
  const DOT_RADIUS = 1.5;

  const mouse = { x: 0, y: 0, strength: 0 };
  const target = { x: 0, y: 0, strength: 0 };
  const ripples = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let onScreen = true;
  let lastDraw = 0;

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = n => Math.max(0, Math.min(1, n));
  const smoothstep = n => {
    const t = clamp01(n);
    return t * t * (3 - 2 * t);
  };

  // Textura discreta: pontos fixos sobre o azul oficial, sem cores extras.
  const tile = document.createElement('canvas');
  tile.width = 64;
  tile.height = 64;
  const tileCtx = tile.getContext('2d');
  let dotPattern = null;
  if (tileCtx) {
    tileCtx.fillStyle = 'rgba(255,255,255,0.055)';
    for (const [x, y] of [[16, 16], [48, 16], [16, 48], [48, 48]]) {
      tileCtx.beginPath();
      tileCtx.arc(x, y, 0.75, 0, Math.PI * 2);
      tileCtx.fill();
    }
    dotPattern = ctx.createPattern(tile, 'repeat');
  }

  function resize() {
    const rect = cover.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }

  function warpedPoint(gx, gy, col, row, cols, rows) {
    // Mantém as bordas estáveis enquanto o centro acompanha o cursor.
    const edge = 1.5;
    const pinX = clamp01(Math.min(col / edge, (cols - 1 - col) / edge));
    const pinY = clamp01(Math.min(row / edge, (rows - 1 - row) / edge));
    const pin = pinX * pinX * pinY * pinY;

    const dx = gx - mouse.x;
    const dy = gy - mouse.y;
    const dist = Math.hypot(dx, dy);
    const proximity = clamp01(1 - dist / RADIUS) * pin * mouse.strength;

    let rx = 0;
    let ry = 0;
    for (const wave of ripples) {
      const ox = gx - wave.x;
      const oy = gy - wave.y;
      const waveDist = Math.hypot(ox, oy);
      const difference = waveDist - wave.radius;
      if (Math.abs(difference) < WAVE_WIDTH && waveDist > 0.01) {
        const strength = (1 - Math.abs(difference) / WAVE_WIDTH) * wave.opacity * 21 * pin;
        const direction = difference < 0 ? 1 : -1;
        rx += (ox / waveDist) * strength * direction;
        ry += (oy / waveDist) * strength * direction;
      }
    }

    if (dist < RADIUS && dist > 0.01 && pin > 0 && mouse.strength > 0.001) {
      const t = dist / RADIUS;
      const falloff = (1 - t) * (1 - t) * Math.min(1, dist / 60);
      const warp = falloff * MAX_WARP * pin * mouse.strength;
      rx -= (dx / dist) * warp;
      ry -= (dy / dist) * warp;
    }

    return { x: gx + rx, y: gy + ry, proximity };
  }

  function draw(now) {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);

    if (dotPattern) {
      ctx.fillStyle = dotPattern;
      ctx.fillRect(0, 0, width, height);
    }

    // Luz azul muito sutil acompanha o ponteiro, sem substituir o efeito da logo.
    if (mouse.strength > 0.002) {
      const halo = ctx.createRadialGradient(mouse.x, mouse.y, 8, mouse.x, mouse.y, 285);
      halo.addColorStop(0, `rgba(33,31,167,${(0.22 * mouse.strength).toFixed(3)})`);
      halo.addColorStop(1, 'rgba(33,31,167,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(mouse.x - 285, mouse.y - 285, 570, 570);
    }

    const cols = Math.ceil(width / CELL) + 1;
    const rows = Math.ceil(height / CELL) + 1;
    const stepX = width / Math.max(1, cols - 1);
    const stepY = height / Math.max(1, rows - 1);
    const points = [];

    for (let r = 0; r < rows; r++) {
      const line = [];
      for (let c = 0; c < cols; c++) {
        line.push(warpedPoint(c * stepX, r * stepY, c, r, cols, rows));
      }
      points.push(line);
    }

    // As linhas mudam gradualmente de branco discreto para azul forte #211FA7.
    function segment(a, b) {
      const active = smoothstep((a.proximity + b.proximity) / 2);
      const red = Math.round(lerp(255, 33, active));
      const green = Math.round(lerp(255, 31, active));
      const blue = Math.round(lerp(255, 167, active));
      const alpha = lerp(0.115, 0.95, active);
      ctx.strokeStyle = `rgba(${red},${green},${blue},${alpha.toFixed(3)})`;
      ctx.lineWidth = lerp(0.85, 1.85, active);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 1; c++) segment(points[r][c], points[r][c + 1]);
    }
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols; c++) segment(points[r][c], points[r + 1][c]);
    }

    for (const row of points) {
      for (const point of row) {
        const active = smoothstep(point.proximity);
        const dotRadius = lerp(DOT_RADIUS, 3.0, active);
        if (active > 0.12) {
          const glowRadius = dotRadius + active * 9;
          const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, glowRadius);
          glow.addColorStop(0, `rgba(33,31,167,${(active * 0.56).toFixed(3)})`);
          glow.addColorStop(1, 'rgba(33,31,167,0)');
          ctx.beginPath();
          ctx.arc(point.x, point.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${lerp(0.22, 0.94, active).toFixed(3)})`;
        ctx.fill();
      }
    }

    // Clique: ondas concêntricas se propagam pela malha.
    for (const wave of ripples) {
      if (wave.radius <= 0) continue;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(30,61,139,${(wave.opacity * 0.7).toFixed(3)})`;
      ctx.lineWidth = 1.7;
      ctx.stroke();
    }
  }

  function animate(now) {
    frame = 0;
    if (!onScreen || REDUCED) return;

    // Evita renderização excessiva em monitores com taxa muito alta.
    if (now - lastDraw >= 15) {
      const delta = Math.min(0.05, Math.max(0, (now - (lastDraw || now)) / 1000));
      lastDraw = now;
      mouse.x = lerp(mouse.x, target.x, SMOOTHING);
      mouse.y = lerp(mouse.y, target.y, SMOOTHING);
      mouse.strength = lerp(mouse.strength, target.strength, 0.09);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const wave = ripples[i];
        const age = (now - wave.born) / 1000;
        wave.radius = Math.max(0, age * WAVE_SPEED);
        wave.opacity = Math.max(0, 1 - age * 1.06);
        if (wave.opacity <= 0) ripples.splice(i, 1);
      }
      draw(now);
    }
    frame = requestAnimationFrame(animate);
  }

  const localPosition = e => {
    const rect = cover.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  if (!REDUCED) {
    cover.addEventListener('pointerenter', e => {
      const { x, y } = localPosition(e);
      target.x = x;
      target.y = y;
      if (mouse.strength < 0.05) {
        mouse.x = x;
        mouse.y = y;
      }
      target.strength = 1;
    }, { passive: true });

    cover.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const { x, y } = localPosition(e);
      target.x = x;
      target.y = y;
      target.strength = 1;
    }, { passive: true });

    cover.addEventListener('pointerleave', () => {
      target.strength = 0;
    }, { passive: true });

    cover.addEventListener('pointerdown', e => {
      if (e.button !== 0 && e.pointerType !== 'touch') return;
      const { x, y } = localPosition(e);
      if (e.pointerType === 'touch') {
        mouse.x = x;
        mouse.y = y;
        target.x = x;
        target.y = y;
        mouse.strength = 0.65;
        target.strength = 0;
      }
      ripples.push({ x, y, radius: 0, opacity: 1, born: performance.now() });
      if (ripples.length > 7) ripples.shift();
    }, { passive: true });
  }

  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(cover);
  else window.addEventListener('resize', resize, { passive: true });

  if (!REDUCED && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      onScreen = entries.some(entry => entry.isIntersecting);
      if (onScreen && !frame) frame = requestAnimationFrame(animate);
      else if (!onScreen && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        target.strength = 0;
      }
    }, { threshold: 0.01 }).observe(cover);
  }
  if (!REDUCED && !frame) frame = requestAnimationFrame(animate);
}

/** Preserva os efeitos e microinterações existentes do manual. */
export function initExperience() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pages = [...document.querySelectorAll('.page')];
  // Numeração consistente após consolidação de 23 para 21 telas.
  pages.forEach((screen, index) => {
    const label = `${String(index+1).padStart(2,'0')} / ${String(pages.length).padStart(2,'0')}`;
    const top = screen.querySelector('.page-meta');
    const bottom = screen.querySelector('.page-foot span:last-child');
    if (top) top.textContent = label;
    if (bottom && /^\s*\d+\s*\/\s*\d+\s*$/.test(bottom.textContent)) bottom.textContent = label;
  });
  const animated = [
    '.intro', '.logo-family', '.color-design', '.mini-contrast',
    '.hierarchy-compact article', '.index-group', '.brand-lead',
    '.value-stack > div', '.value-tiles article', '.arch-card',
    '.logo-variant', '.symbol-variant', '.usage-top > *', '.misuse-card',
    '.color-card', '.distribution-card', '.contrast-card', '.type-panel',
    '.hierarchy-example', '.shape-panel', '.texture-card', '.icon-item',
    '.photo-large', '.photo-small', '.format', '.social-mock', '.lab-menu',
    '.lab-preview', '.voice-do', '.voice-dont', '.checklist-grid label',
    '.download-card'
  ].join(',');
  const elements = [...document.querySelectorAll(animated)];
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px 65px 0px' })
    : null;

  if (!reducedMotion.matches && revealObserver) {
    elements.forEach((element, index) => {
      element.classList.add('is-revealable');
      element.style.setProperty('--reveal-delay', `${(index % 3) * 65}ms`);
      revealObserver.observe(element);
    });
  }

  // Interação da logo desativada.

  // Navegação e nome da página continuam sincronizados com o scroll.
  const location = document.querySelector('#pageName');
  const locationObserver = location && 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) location.textContent = visible.target.dataset.title || 'Manual de marca';
      }, { threshold: [0.35, 0.55, 0.8] })
    : null;
  pages.forEach(page => locationObserver?.observe(page));

  initKineticCover(reducedMotion);
  initOrigamiAtmosphere(reducedMotion);
  initCinematicChapters(reducedMotion);
  initBrandHeaderSeal();
}

/** Hover das variantes de logo, mantendo suporte a toque e teclado. */
function initLogoVariantHover() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  for (const family of document.querySelectorAll('.logo-family')) {
    family.addEventListener('pointerenter', () => { family.open = true; });
    family.addEventListener('pointerleave', () => {
      if (!family.contains(document.activeElement)) family.open = false;
    });
    family.addEventListener('focusout', event => {
      if (!family.contains(event.relatedTarget) && !family.matches(':hover')) family.open = false;
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLogoVariantHover, { once: true });
} else {
  initLogoVariantHover();
}


/** Símbolos oficiais da marca em movimento suave nos fundos azuis. */
function initOrigamiAtmosphere(reducedMotion) {
  const screens = [...document.querySelectorAll('.page:nth-of-type(odd):not(.cover)')];
  if (!screens.length || reducedMotion.matches) return;
  const isSmall = window.matchMedia('(max-width: 720px)').matches;
  screens.forEach((screen, slide) => {
    if (screen.querySelector('.ebp-origami-atmosphere')) return;
    const atmosphere = document.createElement('div');
    atmosphere.className = 'ebp-origami-atmosphere';
    atmosphere.setAttribute('aria-hidden', 'true');
    const count = isSmall ? 4 : 8;
    for (let i=0; i<count; i++) {
      const bird = document.createElement('div');
      bird.className = 'ebp-origami-drifter';
      const seed = i*29 + slide*13;
      const mod = (n, d) => (n % d + d) % d;
      const y0 = mod(seed*7+11, 82) + 8;
      const y1 = Math.max(4, Math.min(93, y0 + mod(seed*3, 33)-16));
      bird.style.setProperty('--flight-start', `${y0}%`);
      bird.style.setProperty('--flight-end', `${y1}%`);
      bird.style.setProperty('--flight-tilt', `${mod(seed*13, 23)-11}deg`);
      bird.style.setProperty('--bird-scale', (0.35 + mod(seed*17+3, 40)/100).toFixed(2));
      bird.style.setProperty('--flight-duration', `${24 + mod(seed*5+9, 17)}s`);
      bird.style.setProperty('--flight-delay', `${-mod(seed*17+19, 38)}s`);
      bird.innerHTML = `<img class="ebp-floating-symbol ${i % 2 ? 'ebp-floating-symbol-white' : 'ebp-floating-symbol-orange'}" src="/assets/logos/simbolo-laranja.png" alt="" loading="lazy" draggable="false">`;
      atmosphere.appendChild(bird);
    }
    screen.prepend(atmosphere);
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('ambient-in-view', entry.isIntersecting));
    }, { rootMargin: '120px 0px 120px 0px' });
    screens.forEach(screen => observer.observe(screen));
  } else screens.forEach(screen => screen.classList.add('ambient-in-view'));
}


/** Brand header: official symbol in a dark-blue orbital link. No logo redraws. */
function initBrandHeaderSeal() {
  for (const header of document.querySelectorAll('.page-top .running')) {
    if (header.classList.contains('brand-manual-home')) continue;
    const link = document.createElement('a');
    link.href = '#s01';
    link.className = 'running brand-manual-home';
    link.setAttribute('aria-label', 'Manual da Marca — voltar à capa');
    const badge = document.createElement('span');
    badge.className = 'brand-manual-orb';
    const symbol = document.createElement('img');
    symbol.src = '/assets/logos/simbolo-preto.png';
    symbol.alt = '';
    symbol.loading = 'lazy';
    badge.append(symbol);
    const title = document.createElement('span');
    title.className = 'brand-manual-title';
    title.textContent = 'MANUAL DA MARCA';
    link.append(badge, title);
    header.replaceWith(link);
  }
}

/** Curtain-style chapter reveals inspired by motion-footer, without freezing pages.
 * Safe on long chapters; respects reduced-motion and keyboard navigation.
 */
function initCinematicChapters(reducedMotion) {
  const pages = [...document.querySelectorAll('#manual > .page')];
  if (!pages.length) return;
  const canObserve = 'IntersectionObserver' in window;
  pages.forEach((page, i) => {
    page.classList.add('cinematic-chapter');
    if (i < pages.length - 1 && !page.querySelector('.cinematic-next-link')) {
      const foot = page.querySelector('.page-foot');
      if (foot) {
        const next = document.createElement('a');
        next.className = 'cinematic-next-link';
        next.href = '#' + pages[i + 1].id;
        next.setAttribute('aria-label', 'Rolar para ' + (pages[i + 1].dataset.title || 'próxima seção'));
        next.innerHTML = '<span>PRÓXIMA SEÇÃO</span><span class="cinematic-next-circle" aria-hidden="true">↓</span>';
        foot.appendChild(next);
      }
    }
  });
  if (reducedMotion.matches || !canObserve) {
    pages.forEach(page => page.classList.add('cinematic-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('cinematic-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold:0.035, rootMargin:'0px 0px 0px 0px' });
  pages.forEach(page => observer.observe(page));
  // Soft viewport-responsive light follows reading progress, without fixed-position masks.
  let raf = 0;
  const update = () => {
    raf = 0;
    const vh = window.innerHeight || 1;
    for (const page of pages) {
      const rect = page.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > vh + 100) continue;
      const offset = Math.max(-55, Math.min(55, (rect.top / vh) * -35));
      page.style.setProperty('--cinematic-ambient-y', offset.toFixed(1) + 'px');
    }
  };
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, {passive:true});
  window.addEventListener('resize', update, {passive:true});
  update();
}
