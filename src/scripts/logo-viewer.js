/** Prévia das variantes oficiais do EBP. A superfície acompanha a variante escolhida. */
export function initLogoViewer() {
  const tool = document.getElementById('brandPreviewTool');
  if (!tool) return;
  const stage = document.getElementById('brandPreviewStage');
  const full = document.getElementById('brandLogoFull');
  const horizontal = document.getElementById('brandLogoHorizontal');
  const symbol = document.getElementById('brandLogoSymbol');
  const status = document.getElementById('brandPreviewStatus');
  const buttons = [...tool.querySelectorAll('[data-brand-variant]')];
  const versions = {
    original: {
      name: 'original', background: '#1E3D8B', surface: 'azul Bidu',
      full: 'logo-ebp-original.svg', horizontal: 'assinatura-amarelo.png', symbol: 'simbolo-laranja.png'
    },
    'azul-escuro': {
      name: 'azul-escura', background: '#FFFFFF', surface: 'branco',
      full: 'logo-ebp-azul-escuro.svg', horizontal: 'assinatura-azul-escuro.png', symbol: 'simbolo-azul-escuro.png'
    },
    preto: {
      name: 'preta', background: '#FFFFFF', surface: 'branco',
      full: 'logo-ebp-preto-original.svg', horizontal: 'assinatura-preto.png', symbol: 'simbolo-preto.png'
    },
    cinza: {
      name: 'cinza 50%', background: '#FFFFFF', surface: 'branco',
      full: 'logo-ebp-preto-original.svg', horizontal: 'assinatura-cinza.png', symbol: 'simbolo-cinza.png', grayFull: true
    },
    branco: {
      name: 'branca', background: '#0D0D3F', surface: 'azul escuro',
      full: 'logo-ebp-preto-original.svg', horizontal: 'assinatura-preto.png', symbol: 'simbolo-preto.png', whiteFilter: true
    },
    laranja: {
      name: 'laranja', background: '#0D0D3F', surface: 'azul escuro',
      full: 'assinatura-laranja.png', horizontal: 'assinatura-laranja-horizontal.png', symbol: 'simbolo-laranja.png'
    }
  };
  function show(key) {
    const cfg = versions[key];
    if (!cfg) return;
    for (const [img, file, type] of [
      [full, cfg.full, 'full'],
      [horizontal, cfg.horizontal, 'horizontal'],
      [symbol, cfg.symbol, 'symbol']
    ]) {
      img.src = `/assets/logos/${file}`;
      img.classList.toggle('brand-preview-white-filter', Boolean(cfg.whiteFilter));
      img.classList.toggle('brand-preview-half-filter', Boolean(cfg.grayFull && type === 'full'));
    }
    stage.style.setProperty('--preview-surface', cfg.background);
    stage.dataset.variant = key;
    const dark = cfg.background !== '#FFFFFF';
    stage.classList.toggle('preview-on-dark', dark);
    stage.classList.toggle('preview-on-light', !dark);
    status.textContent = `Versão ${cfg.name} · fundo ${cfg.surface}`;
    for (const button of buttons) {
      const active = button.dataset.brandVariant === key;
      button.classList.toggle('is-current', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }
  for (const button of buttons) button.addEventListener('click', () => show(button.dataset.brandVariant));
  show('original');
}
