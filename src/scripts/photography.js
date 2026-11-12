/**
 * Galeria da seção Fotografia — independente dos controles globais.
 * Troca as 3 cenas automaticamente e mantém o destaque na miniatura ativa.
 */
const section = document.getElementById('s17');

if (section && !section.dataset.photoInitialized) {
  section.dataset.photoInitialized = 'true';

  const radios = [...section.querySelectorAll('.ebp-photo-choice')];
  const thumbnails = [...section.querySelectorAll('.ebp-photo-thumb')];
  const counter = section.querySelector('.ebp-photo-index');
  const pauseButton = section.querySelector('.ebp-photo-autoplay');
  const intervalMs = 4600;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const chapters = [...document.querySelectorAll('#manual > section.page')];
  const chapterIndex = chapters.indexOf(section);
  let current = Math.max(0, radios.findIndex(radio => radio.checked));
  let timer = 0;
  let isActive = false;
  let userPaused = false;

  function updateScene(index) {
    current = (index + radios.length) % radios.length;
    radios[current].checked = true;
    if (counter) counter.innerHTML = `${String(current + 1).padStart(2, '0')} <i>/</i> ${String(radios.length).padStart(2, '0')}`;
    thumbnails.forEach((label, idx) => label.setAttribute('aria-pressed', String(idx === current)));
  }

  function stopTimer() {
    if (timer) window.clearTimeout(timer);
    timer = 0;
  }

  function scheduleNext() {
    stopTimer();
    if (!isActive || userPaused || document.hidden || reducedMotion.matches || radios.length < 2) return;
    timer = window.setTimeout(() => {
      updateScene(current + 1);
      scheduleNext();
    }, intervalMs);
  }

  function updatePauseButton() {
    if (!pauseButton) return;
    pauseButton.setAttribute('aria-pressed', String(userPaused));
    const label = userPaused ? 'Retomar troca automática de fotos' : 'Pausar troca automática de fotos';
    pauseButton.setAttribute('aria-label', label);
    pauseButton.title = label;
  }

  radios.forEach((radio, index) => {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      updateScene(index);
      scheduleNext(); // Seleção manual reinicia o ciclo de 4,6 segundos.
    });
  });

  thumbnails.forEach(label => {
    label.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        label.click();
      }
    });
  });

  pauseButton?.addEventListener('click', () => {
    userPaused = !userPaused;
    updatePauseButton();
    scheduleNext();
  });

  document.addEventListener('visibilitychange', scheduleNext);
  reducedMotion.addEventListener?.('change', scheduleNext);

  // O controlador do manual informa qual cartão está aberto. Não anima fora da seção.
  document.addEventListener('ebp:deck-active', event => {
    const nowActive = Number(event.detail?.index) === chapterIndex;
    if (isActive !== nowActive) {
      isActive = nowActive;
      if (isActive) updateScene(0);
      scheduleNext();
    }
  });

  // Suporte à navegação/rolagem nativa, sem depender do controlador.
  const observer = new IntersectionObserver(entries => {
    const entry = entries[0];
    if (!document.documentElement.classList.contains('ebp-step-deck')) {
      isActive = !!entry?.isIntersecting && entry.intersectionRatio > 0.28;
      scheduleNext();
    }
  }, { threshold: [0, 0.3, 0.65] });
  observer.observe(section);

  updateScene(current);
  updatePauseButton();
}
