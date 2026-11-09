/** Copy color HEX codes from the brand palette with the original notification behavior. */
export function initColors() {
  let toastTimer;
  function toast(value) {
    const element = document.getElementById('toast');
    element.textContent = value;
    element.classList.add('open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('open'), 2100);
  }

  document.querySelectorAll('[data-copy]').forEach(element => element.addEventListener('click', async () => {
    const value = element.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      toast('Código copiado: ' + value);
    } catch (error) {
      // Compatible fallback for older and non-secure browser contexts.
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = 0;
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      toast(copied ? 'Código copiado: ' + value : 'Código HEX: ' + value);
    }
  }));
}
