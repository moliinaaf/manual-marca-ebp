/** Page-stacking movement inspired by scroll-stacking-cards.
 * Uses native scroll and CSS sticky, never replaces or removes manual content.
 */
export function initScrollStack() {
  const pages = [...document.querySelectorAll('#manual > .page')];
  if (!pages.length) return;
  pages.forEach((p,i) => p.style.zIndex = String(i+1));
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let queued = false;
  function update() {
    queued = false;
    const vh = Math.max(1,window.innerHeight);
    for (let i=0; i<pages.length-1; i++) {
      const nextTop = pages[i+1].getBoundingClientRect().top;
      const entering = Math.max(0,Math.min(1,(vh-nextTop)/vh));
      // The active page recedes slightly as the following page covers it.
      const scale = reduced.matches ? 1 : 1 - Math.pow(entering,1.6)*0.035;
      pages[i].style.setProperty('--stack-scale',String(scale));
    }
  }
  function onScroll() { if(!queued){queued=true;requestAnimationFrame(update);} }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  update();
}
