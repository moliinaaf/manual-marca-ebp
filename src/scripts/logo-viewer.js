/**
 * EBP — três versões oficiais: Original, Positiva e Negativa.
 * O seletor controla somente #s07 e utiliza imagens reais, sem filtros CSS.
 */
export function initLogoViewer() {
  const tool = document.getElementById('brandPreviewTool');
  const screen = document.getElementById('s07');
  const stage = document.getElementById('brandPreviewStage');
  if (!tool || !screen || !stage) return;

  const images = {
    combined: document.getElementById('brandLogoCombined'),
    full: document.getElementById('brandLogoFull'),
    horizontal: document.getElementById('brandLogoHorizontal'),
    symbol: document.getElementById('brandLogoSymbol'),
  };
  const status = document.getElementById('brandPreviewStatus');
  const buttons = [...tool.querySelectorAll('[data-brand-variant]')];
  const base = '/assets/logos/';
  const versions = {
    original: {
      bg: '#FFFFFF',
      label: 'Versão original · logotipos coloridos',
      combined: 'logo-combinado-ebp-eletrobidu-colorido.png',
      full: 'logo-original-colorido-claro-principal.png',
      horizontal: 'logo-original-colorido-claro-horizontal.png',
      symbol: 'logo-original-colorido-claro-symbol.png',
    },
    positiva: {
      bg: '#0F0F0F',
      label: 'Versão positiva · logotipos claros',
      combined: 'ebp-v3-combinado-positiva.png',
      full: 'ebp-v3-principal-positiva.png',
      horizontal: 'ebp-v3-horizontal-positiva.png',
      symbol: 'ebp-v3-symbol-positiva.png',
    },
    negativa: {
      bg: '#FFFFFF',
      label: 'Versão negativa · logotipos em preto e cinza',
      combined: 'ebp-v3-combinado-negativa.png',
      full: 'ebp-v3-principal-negativa.png',
      horizontal: 'ebp-v3-horizontal-negativa.png',
      symbol: 'ebp-v3-symbol-negativa.png',
    },
  };

  function setVersion(name) {
    const key = Object.hasOwn(versions, name) ? name : 'original';
    const version = versions[key];
    for (const [role, node] of Object.entries(images)) {
      if (node) node.src = base + version[role];
    }
    screen.dataset.brandTheme = key;
    stage.dataset.brandTheme = key;
    screen.style.setProperty('--preview-surface', version.bg);
    stage.style.setProperty('--preview-surface', version.bg);
    if (status) status.textContent = version.label;
    buttons.forEach(button => {
      const active = button.dataset.brandVariant === key;
      button.classList.toggle('is-current', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => setVersion(button.dataset.brandVariant)));
  setVersion('original');
}
