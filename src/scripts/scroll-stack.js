/**
 * EBP | Deck por rolagem com ajuste de viewport.
 * Não depende de React/shadcn: reutiliza as seções HTML existentes e seus assets.
 *
 * Desktop: os cards ficam ligeiramente menores que a janela e se sobrepõem
 * durante o scroll. Conteúdo é ajustado até 78%; se não houver espaço com
 * legibilidade, a área interna rola sem cortar itens ou reduzir demais a fonte.
 * Mobile/tablet: mantém o fluxo natural para leitura e acessibilidade.
 */
export function initScrollStack() {
  const pages = [...document.querySelectorAll('#manual > .page')];
  if (!pages.length) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const isCompact = () => window.innerWidth <= 820 || window.innerHeight < 520;
  const MIN_FIT = 0.78;
  const EDGE_TOLERANCE = 6;

  let resizeFrame = 0;
  let scrollFrame = 0;
  let resizeTimer = 0;

  function clearFit(page) {
    const inner = page.querySelector('.page-inner');
    page.classList.remove('stack-scroll-body', 'stack-flow');
    if (inner) {
      for (const key of ['width', 'height', 'min-height', 'transform']) {
        inner.style.removeProperty(key);
      }
    }
  }

  function showScrollBody(page, inner) {
    // A capa não possui .page-body; nesses casos o cartão cresce naturalmente.
    if (!page.querySelector('.page-body')) page.classList.add('stack-flow');
    else page.classList.add('stack-scroll-body');
    inner.style.removeProperty('width');
    inner.style.removeProperty('transform');
    inner.style.removeProperty('min-height');
    inner.style.removeProperty('height');
  }

  function applyFit(page) {
    const inner = page.querySelector('.page-inner');
    if (!inner) return;
    clearFit(page);

    if (isCompact()) {
      page.classList.add('stack-flow');
      return;
    }

    const available = page.clientHeight - 3;
    if (available <= 0) return;
    const naturalHeight = Math.ceil(inner.scrollHeight);
    if (naturalHeight <= available + EDGE_TOLERANCE) {
      // Posiciona o rodapé na base do card sem forçar altura ao conteúdo.
      inner.style.setProperty('min-height', `${available}px`, 'important');
      return;
    }

    // Conteúdo que não cabe nem a 78% usa rolagem interna, sem texto microscópico.
    const initialFit = (available - EDGE_TOLERANCE) / naturalHeight;
    if (initialFit < MIN_FIT) {
      showScrollBody(page, inner);
      return;
    }

    let fit = Math.min(1, initialFit);
    // O conteúdo ganha largura proporcional à redução: sem sobras laterais.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      inner.style.setProperty('width', `${(page.clientWidth / fit).toFixed(2)}px`, 'important');
      inner.style.setProperty('min-height', `${(available / fit).toFixed(2)}px`, 'important');
      inner.style.setProperty('transform', `scale(${fit.toFixed(4)})`, 'important');
      const visibleHeight = inner.getBoundingClientRect().height;
      if (visibleHeight <= available + EDGE_TOLERANCE) return;
      fit *= (available - EDGE_TOLERANCE) / Math.max(visibleHeight, 1);
      if (fit < MIN_FIT) {
        showScrollBody(page, inner);
        return;
      }
    }
    // Um elemento que não pode ser ajustado nunca é escondido atrás da borda.
    if (inner.getBoundingClientRect().height > available + EDGE_TOLERANCE) {
      showScrollBody(page, inner);
    }
  }

  function updateStack() {
    scrollFrame = 0;
    if (isCompact() || reduceMotion.matches) {
      pages.forEach(page => page.style.removeProperty('--stack-scale'));
      return;
    }
    const viewportHeight = window.innerHeight;
    for (let i = 0; i < pages.length; i += 1) {
      const next = pages[i + 1];
      if (!next) {
        pages[i].style.setProperty('--stack-scale', '1');
        continue;
      }
      const nextTop = next.getBoundingClientRect().top;
      const progress = Math.min(1, Math.max(0,
        (viewportHeight * 0.90 - nextTop) / (viewportHeight * 0.90)
      ));
      pages[i].style.setProperty('--stack-scale', (1 - progress * 0.022).toFixed(4));
    }
  }

  function scheduleStackUpdate() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateStack);
  }

  function fitAll() {
    resizeFrame = 0;
    pages.forEach((page, index) => {
      page.style.zIndex = String(index + 1);
      page.style.removeProperty('--stack-scale');
      applyFit(page);
    });
    scheduleStackUpdate();
  }

  function scheduleFit() {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (!resizeFrame) resizeFrame = requestAnimationFrame(fitAll);
    }, 100);
  }

  // Normaliza o layout antes da primeira renderização; recalcula ao carregar fontes
  // e imagens, ao redimensionar o Opera ou alterar o zoom do navegador.
  fitAll();
  window.addEventListener('resize', scheduleFit, { passive: true });
  window.addEventListener('orientationchange', scheduleFit, { passive: true });
  window.addEventListener('scroll', scheduleStackUpdate, { passive: true });
  window.addEventListener('load', scheduleFit, { once: true });
  document.fonts?.ready.then(scheduleFit).catch(() => {});
  document.querySelectorAll('#manual img').forEach(image => {
    if (!image.complete) image.addEventListener('load', scheduleFit, { once: true });
  });

  // Quando o usuário abre outro capítulo pelo menu, a leitura desse cartão
  // recomeça do topo em vez de reutilizar o scroll interno da visita anterior.
  document.querySelectorAll('.nav-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      pages[index]?.querySelector('.page-body')?.scrollTo({ top: 0, behavior: 'auto' });
    });
  });
}
