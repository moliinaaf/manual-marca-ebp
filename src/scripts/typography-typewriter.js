/**
 * EBP — digitação da seção "Tipografia e hierarquia".
 * Os textos permanecem no HTML por padrão: se JS estiver desabilitado,
 * nada desaparece. Executa ao entrar na seção, reinicia ao voltar.
 */
export function initTypographyTypewriter() {
  const page = document.getElementById('s12');
  const root = document.getElementById('manual');
  if (!page || !root) return;

  const nodes = [...page.querySelectorAll('[data-typewriter]')];
  const originals = nodes.map(node => node.textContent);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pageIndex = [...root.querySelectorAll(':scope > .page')].indexOf(page);
  const cues = [
    { delay: 0, speed: 85 },     // Barlow
    { delay: 600, speed: 65 },   // Condensed
    { delay: 450, speed: 145 },  // Inter
    { delay: 1480, speed: 53 },  // Título
    { delay: 1550, speed: 46 },  // Subtítulo
    { delay: 1680, speed: 39 },  // Corpo
  ];
  let animationFrame = 0;
  let playing = false;
  let previousActive = null;

  function restore() {
    cancelAnimationFrame(animationFrame);
    playing = false;
    page.classList.remove('ebp-type-is-playing');
    nodes.forEach((node, index) => {
      node.textContent = originals[index];
      node.classList.remove('ebp-type-caret');
    });
  }

  function play() {
    restore();
    if (reduced.matches) return;
    playing = true;
    page.classList.add('ebp-type-is-playing');
    nodes.forEach(node => { node.textContent = ''; });

    let startTime = null;
    function frame(time) {
      if (!playing) return;
      if (startTime === null) startTime = time;
      // Aguarda o assentamento do card após a transição entre capítulos.
      const elapsed = time - startTime - 360;
      let complete = true;

      nodes.forEach((node, index) => {
        const cue = cues[index] || { delay: 1800, speed: 50 };
        const text = originals[index];
        const letters = Array.from(text);
        const at = Math.max(0, Math.min(letters.length, Math.floor((elapsed - cue.delay) / cue.speed)));
        if (at < letters.length) complete = false;
        const nextText = letters.slice(0, at).join('');
        if (node.textContent !== nextText) node.textContent = nextText;
        // Cada palavra ou exemplo possui seu próprio cursor, inclusive quando
        // vários textos são digitados simultaneamente.
        node.classList.toggle('ebp-type-caret', elapsed >= cue.delay);
      });
      if (!complete) {
        animationFrame = requestAnimationFrame(frame);
      } else {
        playing = false;
        // Mantém uma barrinha piscando no final de CADA texto concluído.
        nodes.forEach(node => node.classList.add('ebp-type-caret'));
      }
    }
    animationFrame = requestAnimationFrame(frame);
  }

  document.addEventListener('ebp:deck-active', event => {
    const isActive = Number(event.detail?.index) === pageIndex;
    if (isActive === previousActive) return;
    previousActive = isActive;
    if (isActive) play();
    else restore();
  });

  reduced.addEventListener?.('change', () => {
    if (reduced.matches) restore();
  });
}
