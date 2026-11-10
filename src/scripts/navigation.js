/** Navegação flutuante do manual; controlador visual sincronizado com o deck. */
export function initNavigation() {
  const slides = [...document.querySelectorAll('#manual > .page')];
  const navLinks = [...document.querySelectorAll('.nav-item')];
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('backdrop');
  const menu = document.getElementById('menuButton');
  const counter = document.getElementById('pageCounter');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const bar = document.getElementById('progress');
  const pageName = document.getElementById('pageName');
  const search = document.getElementById('navSearch');
  const searchStatus = document.getElementById('navSearchStatus');
  const glassBar = document.querySelector('.ebp-glass-deck');
  let current = 0;
  let glassTimer = 0;

  function setMenu(open) {
    drawer.classList.toggle('open', open);
    backdrop.classList.toggle('visible', open);
    menu.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.inert = !open;
    if (open) window.setTimeout(() => { if (drawer.classList.contains('open')) search?.focus(); }, 300);
    else if (drawer.contains(document.activeElement)) menu.focus();
  }

  function update(index) {
    current = Math.min(slides.length - 1, Math.max(0, index));
    counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + slides.length;
    if (pageName) pageName.textContent = slides[current].dataset.title || 'Manual';
    if (bar) bar.style.width = `${((current + 1) / slides.length) * 100}%`;
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    navLinks.forEach((element, index) => {
      element.classList.toggle('active', current === index);
      element.setAttribute('aria-current', current === index ? 'page' : 'false');
    });
  }

  function showGlassPulse(side) {
    if (!glassBar) return;
    glassBar.dataset.pulse = side;
    window.clearTimeout(glassTimer);
    glassTimer = window.setTimeout(() => { delete glassBar.dataset.pulse; }, 680);
  }

  function goTo(index, source = 'button') {
    const destination = Math.min(slides.length - 1, Math.max(0, index));
    if (destination === current && source !== 'menu') { setMenu(false); return; }
    const event = new CustomEvent('ebp:deck-navigate', { cancelable: true, detail: { index: destination, source } });
    document.dispatchEvent(event);
    // Fallback quando o controlador ainda não estiver inicializado.
    if (!event.defaultPrevented) {
      slides[destination].scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
    if (source === 'previous') showGlassPulse('previous');
    if (source === 'next') showGlassPulse('next');
    update(destination);
    setMenu(false);
  }

  drawer.inert = true;
  menu.addEventListener('click', () => setMenu(!drawer.classList.contains('open')));
  document.getElementById('closeMenu').addEventListener('click', () => setMenu(false));
  backdrop.addEventListener('click', () => setMenu(false));
  navLinks.forEach((element, index) => element.addEventListener('click', () => goTo(index, 'menu')));

  search?.addEventListener('input', () => {
    const query = search.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    let matches = 0;
    navLinks.forEach(item => {
      const normalized = item.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      item.hidden = !normalized.includes(query);
      matches += Number(!item.hidden);
    });
    document.querySelectorAll('.nav-group').forEach(group => {
      group.hidden = ![...group.querySelectorAll('.nav-item')].some(item => !item.hidden);
    });
    searchStatus.textContent = query ? `${matches} capítulo${matches === 1 ? '' : 's'} encontrado${matches === 1 ? '' : 's'}` : '';
  });

  prev.addEventListener('click', () => goTo(current - 1, 'previous'));
  next.addEventListener('click', () => goTo(current + 1, 'next'));
  document.addEventListener('ebp:deck-active', event => {
    const index = event.detail?.index;
    if (Number.isInteger(index)) update(index);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { setMenu(false); return; }
    if (drawer.classList.contains('open')) return;
    const target = document.activeElement;
    if (target?.closest('input,textarea,select,button,a,[contenteditable="true"],[role="tab"]')) return;
    const isNext = ['PageDown', 'ArrowRight'].includes(event.key) || (event.code === 'Space' && !event.shiftKey);
    const isPrev = ['PageUp', 'ArrowLeft'].includes(event.key) || (event.code === 'Space' && event.shiftKey);
    if (isNext) { event.preventDefault(); goTo(current + 1, 'next'); }
    else if (isPrev) { event.preventDefault(); goTo(current - 1, 'previous'); }
    else if (event.key === 'Home') { event.preventDefault(); goTo(0, 'menu'); }
    else if (event.key === 'End') { event.preventDefault(); goTo(slides.length - 1, 'menu'); }
  });

  // Em telas pequenas, onde o deck usa fluxo contínuo, detecta capítulo por scroll.
  let queued = false;
  function updateFromScroll() {
    queued = false;
    if (document.documentElement.classList.contains('ebp-step-deck')) return;
    const line = window.innerHeight * 0.35;
    let active = 0;
    slides.forEach((element, index) => {
      if (element.getBoundingClientRect().top <= line) active = index;
    });
    if (active !== current) update(active);
  }
  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(updateFromScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateFromScroll, { passive: true });
  updateFromScroll();
}
