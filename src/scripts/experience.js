/** Motion and microinteractions; the manual still works with this module disabled. */
export function initExperience() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pages = [...document.querySelectorAll('.page')];
  const animated = [
    '.intro', '.index-group', '.brand-lead', '.value-stack > div', '.value-tiles article',
    '.arch-card', '.logo-variant', '.symbol-variant', '.usage-top > *', '.misuse-card',
    '.color-card', '.distribution-card', '.contrast-card', '.type-panel',
    '.hierarchy-example', '.shape-panel', '.texture-card', '.icon-item',
    '.photo-large', '.photo-small', '.format', '.social-mock', '.lab-menu',
    '.lab-preview', '.voice-do', '.voice-dont', '.checklist-grid label', '.download-card'
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

  // The glow follows only the cover card, without moving or changing the logo itself.
  const coverCard = document.querySelector('.cover-brand');
  if (coverCard && window.matchMedia('(pointer:fine)').matches && !reducedMotion.matches) {
    coverCard.addEventListener('pointermove', event => {
      const bounds = coverCard.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width * 100).toFixed(1);
      const y = ((event.clientY - bounds.top) / bounds.height * 100).toFixed(1);
      coverCard.style.setProperty('--spot-x', `${x}%`);
      coverCard.style.setProperty('--spot-y', `${y}%`);
    }, { passive: true });
    coverCard.addEventListener('pointerleave', () => {
      coverCard.style.removeProperty('--spot-x');
      coverCard.style.removeProperty('--spot-y');
    });
  }

  // Keep progress and navigation labels synchronized if a page changes via scroll.
  const location = document.querySelector('#pageName');
  const locationObserver = location && 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) location.textContent = visible.target.dataset.title || 'Manual de marca';
      }, { threshold: [0.35, 0.55, 0.8] })
    : null;
  pages.forEach(page => locationObserver?.observe(page));
}
