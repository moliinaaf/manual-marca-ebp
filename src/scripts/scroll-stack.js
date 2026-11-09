/** Navegação por capítulos em fluxo natural.
 * Mantém a progressão visual do manual, sem prender telas maiores que a janela.
 */
export function initScrollStack() {
  const pages = [...document.querySelectorAll('#manual > .page')];
  if (!pages.length) return;
  pages.forEach(page => page.style.removeProperty('z-index'));
  // Conserta qualquer estado inline salvo pela versão com position:sticky.
  pages.forEach(page => page.style.removeProperty('--stack-scale'));
}
