/**
 * Superfícies do logotipo EBP.
 * Seletor isolado na seção #s07. Todas as superfícies carregam os
 * arquivos reais da marca, sem aplicar filtros CSS sobre os logotipos.
 */
export function initLogoViewer() {
  const tool = document.getElementById('brandPreviewTool');
  const screen = document.getElementById('s07');
  const stage = document.getElementById('brandPreviewStage');
  if (!tool || !screen || !stage) return;

  const elements = {
    combined: document.getElementById('brandLogoCombined'),
    full: document.getElementById('brandLogoFull'),
    horizontal: document.getElementById('brandLogoHorizontal'),
    symbol: document.getElementById('brandLogoSymbol'),
  };
  const status = document.getElementById('brandPreviewStatus');
  const buttons = Array.from(tool.querySelectorAll('[data-brand-variant]'));
  const path = '/assets/logos/';
  const themes = {
    azul: {
      bg: '#1E3D8B',
      label: 'Superfície azul · logotipos brancos',
      combined: 'logo-combinado-ebp-eletrobidu-branco.png',
      full: 'logo-white-principal.png',
      horizontal: 'logo-white-horizontal.png',
      symbol: 'logo-white-symbol.png',
    },
    preto: {
      bg: '#0F0F0F',
      label: 'Superfície preta · logotipos brancos',
      combined: 'logo-combinado-ebp-eletrobidu-branco.png',
      full: 'logo-white-principal.png',
      horizontal: 'logo-white-horizontal.png',
      symbol: 'logo-white-symbol.png',
    },
    branco: {
      bg: '#FFFFFF',
      label: 'Superfície branca · logotipos coloridos',
      combined: 'logo-combinado-ebp-eletrobidu-colorido.png',
      full: 'logo-original-colorido-claro-principal.png',
      horizontal: 'logo-original-colorido-claro-horizontal.png',
      symbol: 'logo-original-colorido-claro-symbol.png',
    },
    pb: {
      bg: '#FFFFFF',
      label: 'Superfície P&B · logotipos pretos e cinzas',
      combined: 'logo-combinado-ebp-eletrobidu-pb.png',
      full: 'logo-black-principal.png',
      horizontal: 'logo-black-horizontal.png',
      symbol: 'simbolo-cinza.png',
    },
  };

  function showSurface(surface) {
    const key = Object.prototype.hasOwnProperty.call(themes, surface) ? surface : 'branco';
    const configuration = themes[key];
    for (const [role, image] of Object.entries(elements)) {
      if (!image) continue;
      image.src = path + configuration[role];
    }
    screen.dataset.brandTheme = key;
    stage.dataset.brandTheme = key;
    screen.style.setProperty('--preview-surface', configuration.bg);
    stage.style.setProperty('--preview-surface', configuration.bg);
    if (status) status.textContent = configuration.label;
    buttons.forEach(button => {
      const selected = button.dataset.brandVariant === key;
      button.classList.toggle('is-current', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => showSurface(button.dataset.brandVariant));
  });
  showSurface('branco');
}
