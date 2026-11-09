/** Floating navigation, scroll progress, keyboard navigation and page counter. */
export function initNavigation() {
  const slides = [...document.querySelectorAll('.page')];
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
  let current = 0;

  function setMenu(open) {
    drawer.classList.toggle('open', open);
    backdrop.classList.toggle('visible', open);
    menu.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.inert = !open;
    if (open) window.setTimeout(() => { if (drawer.classList.contains('open')) search?.focus(); }, 350);
    else if (drawer.contains(document.activeElement)) menu.focus();
  }

  function update(index) {
    current = Math.min(slides.length - 1, Math.max(0, index));
    counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + slides.length;
    if (pageName) pageName.textContent = slides[current].dataset.title || 'Manual';
    bar.style.width = ((current + 1) / slides.length * 100) + '%';
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    navLinks.forEach((element, index) => {
      element.classList.toggle('active', current === index);
      element.setAttribute('aria-current', current === index ? 'page' : 'false');
    });
  }

  function goTo(index) {
    const targetIndex = Math.min(slides.length - 1, Math.max(0, index));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    slides[targetIndex].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    update(targetIndex);
    setMenu(false);
  }

  drawer.inert = true;
  menu.addEventListener('click', () => setMenu(!drawer.classList.contains('open')));
  document.getElementById('closeMenu').addEventListener('click', () => setMenu(false));
  backdrop.addEventListener('click', () => setMenu(false));
  navLinks.forEach((element, index) => element.addEventListener('click', () => goTo(index)));
  if (search) {
    search.addEventListener('input', () => {
      const query = search.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      let matches = 0;
      navLinks.forEach(item => {
        const normalized = item.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const show = normalized.includes(query);
        item.hidden = !show;
        matches += Number(show);
      });
      document.querySelectorAll('.nav-group').forEach(group => {
        group.hidden = ![...group.querySelectorAll('.nav-item')].some(item => !item.hidden);
      });
      searchStatus.textContent = query ? `${matches} capítulo${matches === 1 ? '' : 's'} encontrado${matches === 1 ? '' : 's'}` : '';
    });
  }
  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));

  // This inline handler was part of the original menu; retain the same click-to-close behavior.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { setMenu(false); return; }
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    if (drawer.classList.contains('open')) return;
    if (['ArrowRight', 'PageDown'].includes(event.key)) { event.preventDefault(); goTo(current + 1); }
    else if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); goTo(current - 1); }
    else if (event.key === 'Home') { event.preventDefault(); goTo(0); }
    else if (event.key === 'End') { event.preventDefault(); goTo(slides.length - 1); }
  });

  const observer = new IntersectionObserver(entries => {
    const entry = entries.filter(item => item.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (entry) update(slides.indexOf(entry.target));
  }, { threshold: [.25, .45, .65] });
  slides.forEach(element => observer.observe(element));
  update(0);
}
