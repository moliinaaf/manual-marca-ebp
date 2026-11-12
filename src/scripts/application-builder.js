/**
 * Seção 19 — simulação da montagem de uma peça da EBP.
 * Sem bibliotecas, sem alterações na navegação global.
 */
const section = document.getElementById('s19');

if (section && !section.dataset.builderReady) {
  section.dataset.builderReady = 'true';

  const workspace = section.querySelector('.ebp-builder-workspace');
  const pointer = section.querySelector('.ebp-builder-pointer');
  const typedTitle = section.querySelector('[data-builder-typing]');
  const description = section.querySelector('[data-builder-description]');
  const kicker = section.querySelector('[data-builder-kicker]');
  const mainPhoto = section.querySelector('[data-builder-photo]');
  const previewPhoto = section.querySelector('[data-builder-preview-photo]');
  const previewTitle = section.querySelector('[data-builder-preview-title]');
  const documentName = section.querySelector('[data-builder-document]');
  const status = section.querySelector('[data-builder-status]');
  const progress = section.querySelector('[data-builder-progress]');
  const caption = section.querySelector('[data-builder-caption]');
  const steps = [...section.querySelectorAll('[data-builder-step]')];
  const variants = [...section.querySelectorAll('[data-builder-variation]')];
  const replayButton = section.querySelector('.ebp-builder-replay');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pages = [...document.querySelectorAll('#manual > .page')];
  const thisIndex = pages.indexOf(section);

  const designs = {
    institucional: {
      name: 'Institucional',
      kicker: 'PROGRAMA DE INDICAÇÕES',
      headline: 'INDIQUE.\nCONECTE.\nCONQUISTE.',
      description: 'Sua indicação pode abrir novas oportunidades.',
      photo: '/assets/images/foto-paineis-mao.jpg'
    },
    educativo: {
      name: 'Educativo',
      kicker: 'PASSO A PASSO',
      headline: 'COMO\nINDICAR.',
      description: 'Compartilhe oportunidades e acompanhe cada indicação.',
      photo: '/assets/images/foto-parceria-aperto.jpg'
    },
    relacionamento: {
      name: 'Relacionamento',
      kicker: 'COMUNIDADE EBP',
      headline: 'PARCERIAS\nQUE GERAM\nVALOR.',
      description: 'Conexões e confiança para construir resultados.',
      photo: '/assets/images/foto-premios.png'
    }
  };

  let currentVariant = 'institucional';
  let active = false;
  let generation = 0;
  const wait = duration => new Promise(resolve => window.setTimeout(resolve, duration));
  const isCurrent = token => token === generation && active && !document.hidden;

  function movePointer(x, y, click = false) {
    pointer.style.left = `${x}%`;
    pointer.style.top = `${y}%`;
    pointer.classList.remove('is-clicking');
    if (click) {
      // Reflow only the isolated cursor to replay its click animation.
      void pointer.offsetWidth;
      pointer.classList.add('is-clicking');
    }
  }

  function setStep(value, text, currentStatus) {
    workspace.dataset.buildStep = String(value);
    progress.textContent = `${String(value).padStart(2, '0')} / 04`;
    caption.textContent = text;
    status.textContent = currentStatus;
    steps.forEach(step => {
      const stepNumber = Number(step.dataset.builderStep);
      step.classList.toggle('is-current', stepNumber === value);
      step.classList.toggle('is-done', stepNumber < value);
    });
  }

  function loadVariant(key) {
    currentVariant = key;
    const design = designs[key];
    documentName.textContent = design.name;
    kicker.textContent = design.kicker;
    description.textContent = design.description;
    mainPhoto.src = design.photo;
    previewPhoto.src = design.photo;
    previewTitle.innerHTML = ''; // use text nodes and breaks, not untrusted HTML
    design.headline.split('\n').forEach((line, i) => {
      if (i) previewTitle.append(document.createElement('br'));
      previewTitle.append(document.createTextNode(line));
    });
    variants.forEach(button => {
      const selected = button.dataset.builderVariation === key;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function showFinished() {
    workspace.classList.add('show-structure', 'show-image', 'show-type', 'show-details');
    workspace.classList.remove('is-typing', 'is-running');
    typedTitle.textContent = designs[currentVariant].headline;
    setStep(4, 'Peça finalizada', 'Arte pronta');
    steps.forEach(step => {
      step.classList.remove('is-current');
      step.classList.add('is-done');
    });
  }

  async function run() {
    const token = ++generation;
    const design = designs[currentVariant];
    workspace.classList.remove('show-structure', 'show-image', 'show-type', 'show-details', 'is-typing', 'is-running');
    typedTitle.textContent = '';
    setStep(0, 'Preparando área de edição', 'Iniciando...');
    movePointer(12, 20);

    if (prefersReducedMotion.matches) {
      showFinished();
      return;
    }
    workspace.classList.add('is-running');
    await wait(360);
    if (!isCurrent(token)) return;

    // 01: arrastar as formas e posicionar o logotipo.
    setStep(1, 'Definindo layout', 'Aplicando estrutura');
    movePointer(26, 18, true);
    workspace.classList.add('show-structure');
    await wait(1100);
    if (!isCurrent(token)) return;

    // 02: arrastar a fotografia para o quadro.
    setStep(2, 'Posicionando fotografia', 'Inserindo imagem');
    movePointer(82, 54);
    await wait(380);
    if (!isCurrent(token)) return;
    movePointer(76, 73, true);
    workspace.classList.add('show-image');
    await wait(1100);
    if (!isCurrent(token)) return;

    // 03: o texto é digitado letra a letra com cursor piscando.
    setStep(3, 'Digitando o título', 'Aplicando tipografia');
    movePointer(31, 48, true);
    workspace.classList.add('show-type', 'is-typing');
    await wait(430);
    if (!isCurrent(token)) return;
    for (const char of design.headline) {
      typedTitle.textContent += char;
      await wait(char === '\n' ? 200 : char === '.' ? 160 : 55);
      if (!isCurrent(token)) return;
    }
    workspace.classList.remove('is-typing');
    await wait(250);
    if (!isCurrent(token)) return;

    // 04: revelar os textos de apoio, CTA e acabamento.
    setStep(4, 'Finalizando detalhes', 'Ajustando acabamento');
    movePointer(29, 84, true);
    workspace.classList.add('show-details');
    await wait(970);
    if (!isCurrent(token)) return;
    showFinished();
  }

  function setActive(value) {
    if (active === value) return;
    active = value;
    if (active) run();
    else {
      generation++;
      workspace.classList.remove('is-running', 'is-typing');
    }
  }

  replayButton.addEventListener('click', () => {
    if (!active) active = true;
    run();
  });
  variants.forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.builderVariation;
      if (!designs[key]) return;
      loadVariant(key);
      // Escolher um exemplo reinicia o processo no capítulo visível.
      if (active) run();
      else showFinished();
    });
  });

  document.addEventListener('ebp:deck-active', event => {
    const index = event.detail?.index;
    if (Number.isInteger(index)) setActive(index === thisIndex);
  });

  const observer = new IntersectionObserver(entries => {
    if (document.documentElement.classList.contains('ebp-step-deck')) return;
    const entry = entries[0];
    setActive(Boolean(entry?.isIntersecting && entry.intersectionRatio > 0.30));
  }, { threshold: [0, .3, .5] });
  observer.observe(section);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      generation++;
      workspace.classList.remove('is-running', 'is-typing');
    } else if (active) {
      run();
    }
  });
  prefersReducedMotion.addEventListener?.('change', () => {
    if (active) run();
    else showFinished();
  });

  loadVariant(currentVariant);
  // Estado completo para carregamentos sem JS de navegação, antes de entrar no slide.
  showFinished();
  requestAnimationFrame(() => {
    if (document.documentElement.classList.contains('ebp-step-deck')) {
      setActive(section.getBoundingClientRect().top > -50 && section.getBoundingClientRect().top < innerHeight * .6);
    }
  });
}
