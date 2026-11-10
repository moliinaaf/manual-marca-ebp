/**
 * Manual EBP — controlador único de capítulos empilhados.
 *
 * Desktop: cada gesto de scroll avança/regride UMA seção e fixa o cartão
 * na mesma posição até o próximo gesto. Se o conteúdo for longo, primeiro
 * percorre-se sua área interna de leitura (nunca é cortado).
 *
 * Todos os caminhos de navegação (rodinha, botões, menu, teclado e âncoras)
 * utilizam navigate(). O mobile mantém o scroll vertical nativo.
 * Sem dependências externas; respeita prefers-reduced-motion.
 */
export function initScrollStack() {
  const root = document.getElementById('manual');
  const pages = [...root?.querySelectorAll(':scope > .page') || []];
  if (!pages.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopMode = () => window.innerWidth > 820 && window.innerHeight >= 520;
  const fitMinimum = 0.78;
  const tolerance = 6;

  // Marcadores normais não acompanham position:sticky. Assim, o ponto de
  // chegada de cada seção é sempre exato, inclusive ao VOLTAR.
  const anchors = pages.map((page, index) => {
    const marker = document.createElement('span');
    marker.className = 'ebp-stack-anchor';
    marker.dataset.chapter = String(index);
    marker.setAttribute('aria-hidden', 'true');
    page.before(marker);
    return marker;
  });

  let active = 0;
  let locked = false;
  let lockUntil = 0;
  let lastWheelAt = 0;
  let lastInternalAt = -Infinity;
  let pendingDelta = 0;
  let pendingDirection = 0;
  let gestureTimer = 0;
  let resizeTimer = 0;
  let scrollFrame = 0;
  let isProgrammatic = false;
  let goToTimeout = 0;
  let programmaticToken = 0;
  let navigationFrame = 0;

  const clamp = value => Math.max(0, Math.min(pages.length - 1, value));
  const deckTop = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--deck-top')) || 12;
  const pageY = index => window.scrollY + anchors[index].getBoundingClientRect().top - deckTop();
  const bodyFor = index => pages[index]?.querySelector('.page-body');

  function notify() {
    document.dispatchEvent(new CustomEvent('ebp:deck-active', { detail: { index: active } }));
  }

  function resetFit(page) {
    const inner = page.querySelector('.page-inner');
    page.classList.remove('stack-scroll-body', 'stack-flow');
    if (!inner) return;
    for (const key of ['width', 'height', 'min-height', 'transform']) inner.style.removeProperty(key);
  }

  function useInternalReading(page, inner) {
    page.classList.add('stack-scroll-body');
    for (const key of ['width', 'height', 'min-height', 'transform']) inner.style.removeProperty(key);
  }

  function fitChapter(page) {
    const inner = page.querySelector('.page-inner');
    if (!inner) return;
    resetFit(page);
    if (!desktopMode()) {
      page.classList.add('stack-flow');
      return;
    }

    const height = page.clientHeight - 3;
    if (height < 1) return;
    const natural = Math.ceil(inner.scrollHeight);
    if (natural <= height + tolerance) {
      inner.style.setProperty('min-height', `${height}px`, 'important');
      return;
    }

    // Não encolher títulos e textos até ficarem ilegíveis.
    let scale = (height - tolerance) / natural;
    if (scale < fitMinimum) {
      useInternalReading(page, inner);
      return;
    }
    for (let attempt = 0; attempt < 3; attempt += 1) {
      inner.style.setProperty('width', `${(page.clientWidth / scale).toFixed(2)}px`, 'important');
      inner.style.setProperty('min-height', `${(height / scale).toFixed(2)}px`, 'important');
      inner.style.setProperty('transform', `scale(${scale.toFixed(4)})`, 'important');
      const visualHeight = inner.getBoundingClientRect().height;
      if (visualHeight <= height + tolerance) return;
      scale *= (height - tolerance) / Math.max(1, visualHeight);
      if (scale < fitMinimum) break;
    }
    useInternalReading(page, inner);
  }

  function findNearestChapter() {
    const position = window.scrollY + deckTop();
    let closest = 0;
    let distance = Infinity;
    anchors.forEach((anchor, index) => {
      const absolute = window.scrollY + anchor.getBoundingClientRect().top;
      const diff = Math.abs(absolute - position);
      if (diff < distance) { distance = diff; closest = index; }
    });
    return closest;
  }

  function setActive(index) {
    const next = clamp(index);
    if (next !== active) {
      active = next;
      notify();
    }
  }

  function scheduleUnlock() {
    clearTimeout(gestureTimer);
    gestureTimer = window.setTimeout(() => {
      const now = performance.now();
      if (now < lockUntil || now - lastWheelAt < 180) {
        scheduleUnlock();
      } else {
        locked = false;
        pendingDelta = 0;
        pendingDirection = 0;
      }
    }, 90);
  }

  function animateTo(targetY, instant, token) {
    cancelAnimationFrame(navigationFrame);
    if (instant) {
      window.scrollTo({ top: targetY, behavior: 'auto' });
      return;
    }
    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;
    const duration = 530;
    let started = null;
    const step = now => {
      if (token !== programmaticToken) return;
      if (started === null) started = now;
      const t = Math.min(1, (now - started) / duration);
      const eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo({ top: Math.round(startY + distance * eased), behavior: 'auto' });
      if (t < 1) navigationFrame = requestAnimationFrame(step);
      else navigationFrame = 0;
    };
    navigationFrame = requestAnimationFrame(step);
  }

  function navigate(index, { source = 'button' } = {}) {
    const next = clamp(index);
    const previous = active;
    // Botões e menu têm prioridade absoluta, mesmo durante uma animação.
    clearTimeout(goToTimeout);
    cancelAnimationFrame(navigationFrame);
    ++programmaticToken;
    const token = programmaticToken;
    isProgrammatic = true;
    locked = true;
    // Pulamos diretamente para capítulos distantes escolhidos no menu,
    // evitando atravessar dezenas de cartões durante o deslocamento.
    const instant = reducedMotion.matches || !desktopMode() || Math.abs(next - previous) > 2;
    lockUntil = performance.now() + (instant ? 200 : 650);
    pendingDelta = 0;
    pendingDirection = 0;
    lastWheelAt = performance.now();

    if (source !== 'wheel') bodyFor(next)?.scrollTo({ top: 0, behavior: 'auto' });
    active = next;
    notify();

    if (!desktopMode()) {
      pages[next].scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    } else {
      const top = Math.max(0, Math.round(pageY(next)));
      animateTo(top, instant, token);
    }
    scheduleUnlock();
    goToTimeout = window.setTimeout(() => {
      if (token !== programmaticToken) return;
      isProgrammatic = false;
    }, instant ? 140 : 625);
  }

  function scrollInsideActive(delta) {
    const body = bodyFor(active);
    if (!body || !pages[active].classList.contains('stack-scroll-body')) return false;
    const maxScroll = Math.max(0, body.scrollHeight - body.clientHeight);
    if (maxScroll <= 5) return false;
    if ((delta > 0 && body.scrollTop < maxScroll - 5) ||
        (delta < 0 && body.scrollTop > 5)) {
      body.scrollTop = Math.max(0, Math.min(maxScroll, body.scrollTop + delta));
      lastInternalAt = performance.now();
      return true;
    }
    // Uma nova rolagem deliberada é necessária após o fim do conteúdo.
    return performance.now() - lastInternalAt < 230;
  }

  function isNestedNativeScroll(target, delta) {
    if (!(target instanceof Element)) return false;
    if (target.closest('#drawer, .nav-drawer, .nav-scroll, [data-native-scroll]')) return true;
    let node = target;
    while (node && node !== root && !node.classList.contains('page')) {
      if (node.classList.contains('page-body')) break;
      const s = getComputedStyle(node);
      if (/(auto|scroll)/.test(s.overflowY) && node.scrollHeight > node.clientHeight + 5) {
        const max = node.scrollHeight - node.clientHeight;
        if ((delta > 0 && node.scrollTop < max - 5) || (delta < 0 && node.scrollTop > 5)) return true;
      }
      node = node.parentElement;
    }
    return false;
  }

  function onWheel(event) {
    if (!desktopMode() || event.ctrlKey || event.metaKey || event.defaultPrevented || document.querySelector('#drawer.open')) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (Math.abs(delta) < 0.2 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (isNestedNativeScroll(event.target, delta)) return;

    event.preventDefault();
    const now = performance.now();
    if (locked) {
      lastWheelAt = now;
      scheduleUnlock();
      return;
    }
    if (scrollInsideActive(delta)) return;

    const direction = Math.sign(delta);
    if (direction !== pendingDirection || now - lastWheelAt > 210) pendingDelta = 0;
    pendingDirection = direction;
    pendingDelta += Math.abs(delta);
    lastWheelAt = now;
    if (pendingDelta < 24) return; // Trackpad: ignora movimentos acidentais.
    navigate(active + direction, { source: 'wheel' });
  }

  function updateStack() {
    scrollFrame = 0;
    if (!desktopMode() || reducedMotion.matches) {
      pages.forEach(page => page.style.removeProperty('--stack-scale'));
      return;
    }
    const viewport = innerHeight;
    pages.forEach((page, index) => {
      const next = pages[index + 1];
      if (!next) { page.style.setProperty('--stack-scale', '1'); return; }
      const nextTop = next.getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, (viewport * 0.85 - nextTop) / (viewport * 0.85)));
      page.style.setProperty('--stack-scale', (1 - progress * 0.022).toFixed(4));
    });
  }

  function updateFromNativeScroll() {
    if (!scrollFrame) {
      scrollFrame = requestAnimationFrame(() => {
        updateStack();
        if (!isProgrammatic) setActive(findNearestChapter());
      });
    }
  }

  function fitAll() {
    pages.forEach((page, index) => {
      page.style.zIndex = String(index + 1);
      page.style.removeProperty('--stack-scale');
      fitChapter(page);
    });
    document.documentElement.classList.toggle('ebp-step-deck', desktopMode());
    updateStack();
    if (!isProgrammatic) setActive(findNearestChapter());
  }

  function scheduleFit() {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(fitAll, 110);
  }

  // Todos os botões e links chamam a mesma navegação. Um botão VOLTAR não
  // depende de scrollIntoView na seção sticky que ficou atrás de outra.
  document.addEventListener('ebp:deck-navigate', event => {
    event.preventDefault();
    navigate(Number(event.detail?.index || 0), { source: event.detail?.source || 'button' });
  });
  document.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a[href^="#s"]') : null;
    if (!link || link.closest('#drawer')) return;
    const id = link.getAttribute('href')?.slice(1);
    const index = pages.findIndex(page => page.id === id);
    if (index < 0) return;
    event.preventDefault();
    navigate(index, { source: 'link' });
  });

  fitAll();
  active = findNearestChapter();
  notify();
  window.addEventListener('wheel', onWheel, { passive: false, capture: true });
  window.addEventListener('scroll', updateFromNativeScroll, { passive: true });
  window.addEventListener('resize', scheduleFit, { passive: true });
  window.addEventListener('orientationchange', scheduleFit, { passive: true });
  window.addEventListener('load', scheduleFit, { once: true });
  document.fonts?.ready.then(scheduleFit).catch(() => {});
  root.querySelectorAll('img').forEach(img => {
    if (!img.complete) img.addEventListener('load', scheduleFit, { once: true });
  });
}
