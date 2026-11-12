/**
 * Seção 19 — vitrine de peças autorais em proporção real.
 * Isolada das demais páginas; sem frameworks ou bibliotecas.
 */
const gallery = document.getElementById('s19');
if (gallery && !gallery.dataset.vitrineReady) {
  gallery.dataset.vitrineReady = 'true';

  const options = [...gallery.querySelectorAll('[data-vitrine-option]')];
  const posters = [...gallery.querySelectorAll('[data-vitrine-art]')];
  const stage = gallery.querySelector('.ebp-vitrine-stage');
  const viewport = gallery.querySelector('.ebp-vitrine-canvas');
  const dimension = gallery.querySelector('[data-vitrine-dimension]');
  const label = gallery.querySelector('[data-vitrine-art-label]');
  const indexLabel = gallery.querySelector('.ebp-vitrine-stage-bottom > span:last-child');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const data = [
    { id: 'quadrado', w: 1080, h: 1080, label: 'INSTITUCIONAL', format: 'FEED QUADRADO' },
    { id: 'retrato', w: 1080, h: 1350, label: 'EDITORIAL', format: 'FEED VERTICAL' },
    { id: 'story', w: 1080, h: 1920, label: 'STORIES', format: 'STORY VERTICAL' }
  ];

  let selected = 0;
  let running = false;
  let hovered = false;
  let visible = false;
  let manuallySelectedAt = 0;
  let timer;

  function sizeArtworks() {
    const availableW = Math.max(100, viewport.clientWidth - 36);
    const availableH = Math.max(100, viewport.clientHeight - 12);
    posters.forEach((poster, i) => {
      const ratio = data[i].w / data[i].h;
      const height = Math.min(availableH, availableW / ratio);
      poster.style.width = `${Math.round(height * ratio)}px`;
      poster.style.height = `${Math.round(height)}px`;
    });
  }

  function choose(index, manual = false) {
    selected = (index + data.length) % data.length;
    const current = data[selected];
    stage.dataset.activeFormat = current.id;
    dimension.textContent = `${current.w} × ${current.h}`;
    label.replaceChildren(document.createTextNode(`${current.label}  ·  ${current.format}`));
    indexLabel.textContent = `PEÇA ${String(selected + 1).padStart(2, '0')} / 03`;

    posters.forEach((poster, i) => {
      const isActive = i === selected;
      poster.classList.toggle('is-active', isActive);
      poster.setAttribute('aria-hidden', String(!isActive));
    });
    options.forEach((button, i) => {
      const isActive = i === selected;
      button.classList.toggle('is-selected', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    if (manual) manuallySelectedAt = Date.now();
    sizeArtworks();
  }

  function stop() {
    running = false;
    clearInterval(timer);
    timer = undefined;
  }

  function start() {
    if (running || reducedMotion.matches || !visible || document.hidden) return;
    running = true;
    timer = setInterval(() => {
      if (!visible || document.hidden || hovered) return;
      // A escolha manual permanece estável durante a leitura da peça.
      if (Date.now() - manuallySelectedAt < 14000) return;
      choose(selected + 1);
    }, 7500);
  }

  options.forEach((button, i) => button.addEventListener('click', () => choose(i, true)));
  stage.addEventListener('mouseenter', () => { hovered = true; });
  stage.addEventListener('mouseleave', () => { hovered = false; });
  stage.addEventListener('focusin', () => { hovered = true; });
  stage.addEventListener('focusout', () => { hovered = false; });

  const observer = new IntersectionObserver(entries => {
    if (document.documentElement.classList.contains('ebp-step-deck')) return;
    visible = Boolean(entries[0]?.isIntersecting && entries[0].intersectionRatio > 0.32);
    if (visible) start();
    else stop();
  }, { threshold: [0, 0.32, 0.6] });
  observer.observe(gallery);
  document.addEventListener('ebp:deck-active', event => {
    const pages = [...document.querySelectorAll('#manual > .page')];
    visible = event.detail?.index === pages.indexOf(gallery);
    if (visible) start();
    else stop();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (visible) start();
  });
  reducedMotion.addEventListener?.('change', () => {
    stop();
    if (visible) start();
  });
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(sizeArtworks).observe(viewport);
  } else {
    window.addEventListener('resize', sizeArtworks);
  }
  choose(0);
  requestAnimationFrame(() => {
    sizeArtworks();
    // Garante a reprodução automática também em acesso direto a #s19.
    if (gallery.getBoundingClientRect().top > -50 &&
        gallery.getBoundingClientRect().top < window.innerHeight * 0.55) {
      visible = true;
      start();
    }
  });
}
