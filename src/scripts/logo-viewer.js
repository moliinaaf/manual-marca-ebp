/** Prévia das variantes oficiais do EBP com fundo adaptativo. */
export function initLogoViewer() {
  const tool = document.getElementById('brandPreviewTool');
  if (!tool) return;
  const stage = document.getElementById('brandPreviewStage');
  const screen = document.getElementById('s07');
  const combined = document.getElementById('brandLogoCombined');
  const full = document.getElementById('brandLogoFull');
  const horizontal = document.getElementById('brandLogoHorizontal');
  const symbol = document.getElementById('brandLogoSymbol');
  const status = document.getElementById('brandPreviewStatus');
  const buttons = [...tool.querySelectorAll('[data-brand-variant]')];
  const versions = {
    original: {
      name: 'original',
      background: '#1E3D8B',
      surface: 'azul',
      theme: 'original',
      combined: 'logo-original-combined.png',
      full: 'logo-original-principal.png',
      horizontal: 'logo-original-horizontal.png',
      symbol: 'logo-original-symbol.png'
    },
    branco: {
      name: 'branca',
      background: '#0F0F0F',
      surface: 'preto',
      theme: 'branco',
      combined: 'logo-white-combined.png',
      full: 'logo-white-principal.png',
      horizontal: 'logo-white-horizontal.png',
      symbol: 'logo-white-symbol.png'
    },
    preto: {
      name: 'preta',
      background: '#FFFFFF',
      surface: 'branco',
      theme: 'preto',
      combined: 'logo-black-combined.png',
      full: 'logo-black-principal.png',
      horizontal: 'logo-black-horizontal.png',
      symbol: 'logo-black-symbol.png'
    }
  };

  function show(key) {
    const cfg = versions[key] || versions.original;
    combined.src = `/assets/logos/${cfg.combined}`;
    full.src = `/assets/logos/${cfg.full}`;
    horizontal.src = `/assets/logos/${cfg.horizontal}`;
    symbol.src = `/assets/logos/${cfg.symbol}`;
    stage.style.setProperty('--preview-surface', cfg.background);
    screen?.style.setProperty('--preview-surface', cfg.background);
    stage.dataset.brandTheme = cfg.theme;
    screen?.setAttribute('data-brand-theme', cfg.theme);
    status.textContent = `Versão ${cfg.name} · fundo ${cfg.surface}`;
    buttons.forEach(button => {
      const active = button.dataset.brandVariant === key;
      button.classList.toggle('is-current', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  buttons.forEach(button => button.addEventListener('click', () => show(button.dataset.brandVariant)));
  show('original');
}
