/** Brand viewer: official EBP artwork only; filters are preview treatments, never edited source assets. */
export function initLogoViewer() {
  const tool = document.getElementById('brandPreviewTool');
  if (!tool) return;
  const stage = document.getElementById('brandPreviewStage');
  const full = document.getElementById('brandLogoFull');
  const horizontal = document.getElementById('brandLogoHorizontal');
  const symbol = document.getElementById('brandLogoSymbol');
  const status = document.getElementById('brandPreviewStatus');
  const choices = [...tool.querySelectorAll('[data-brand-bg]')];
  const versions = [...tool.querySelectorAll('[data-brand-variant]')];
  let background = '#FFFFFF';
  let variant = 'original';
  const paths = {
    original: { full: 'logo-ebp-original.svg', horizontal: 'assinatura-amarelo.png', symbol: 'simbolo-laranja.png' },
    preto: { full: 'logo-ebp-preto-original.svg', horizontal: 'assinatura-preto.png', symbol: 'simbolo-preto.png' },
    cinza: { full: 'logo-ebp-preto-original.svg', horizontal: 'assinatura-cinza.png', symbol: 'simbolo-cinza.png' },
    branco: { full: 'logo-ebp-preto-original.svg', horizontal: 'assinatura-preto.png', symbol: 'simbolo-preto.png' },
    laranja: { full: 'assinatura-laranja.png', horizontal: 'assinatura-laranja-horizontal.png', symbol: 'simbolo-laranja.png' },
  };
  const names = { '#FFFFFF':'branco', '#1E3D8B':'azul Bidu', '#0D0D3F':'azul escuro', '#EF821B':'laranja', '#211FA7':'azul forte', '#FFB703':'amarelo', '#0F0F0F':'preto' };
  function apply() {
    const onLight = ['#FFFFFF', '#FFB703', '#EF821B'].includes(background);
    const imageSet = {...paths[variant]};
    // A assinatura original branca e laranja é exclusiva de fundos escuros.
    if (variant === 'original' && onLight) {
      imageSet.full = 'logo-ebp-preto-original.svg';
      imageSet.horizontal = 'assinatura-azul-profundo.png';
      imageSet.symbol = 'simbolo-azul-profundo.png';
    }
    const pathsToImages = [[full,imageSet.full],[horizontal,imageSet.horizontal],[symbol,imageSet.symbol]];
    for (const [img,file] of pathsToImages) {
      img.src = `/assets/logos/${file}`;
      img.classList.toggle('brand-preview-white-filter', variant === 'branco');
      img.classList.toggle('brand-preview-half-filter', variant === 'cinza' && img === full);
    }
    stage.style.setProperty('--preview-surface',background);
    const dark = !onLight;
    stage.classList.toggle('preview-on-dark',dark);
    stage.classList.toggle('preview-on-light',!dark);
    const poorContrast = (
      (['preto','cinza'].includes(variant) && !onLight) ||
      (variant === 'branco' && onLight) ||
      (variant === 'laranja' && ['#EF821B','#FFB703'].includes(background))
    );
    tool.classList.toggle('preview-low-contrast',poorContrast);
    status.textContent = `Fundo ${names[background]} · versão ${variant === 'cinza'?'cinza 50%':variant}` +
      (poorContrast ? ' · Contraste insuficiente: escolha outra versão' : '');
    choices.forEach(b => { const active=b.dataset.brandBg===background; b.classList.toggle('is-current',active);b.setAttribute('aria-pressed',String(active)); });
    versions.forEach(b => {const active=b.dataset.brandVariant===variant;b.classList.toggle('is-current',active);b.setAttribute('aria-pressed',String(active));});
  }
  choices.forEach(b => b.addEventListener('click',()=>{background=b.dataset.brandBg;apply();}));
  versions.forEach(b => b.addEventListener('click',()=>{variant=b.dataset.brandVariant;apply();}));
  apply();
}
