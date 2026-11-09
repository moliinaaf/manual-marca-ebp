/** Preview the originally-approved logo variant against each available background. */
export function initColorLab() {
  const iconNames = {
    claro: 'simbolo-azul-bidu.png',
    azul: 'simbolo-laranja.png',
    laranja: 'simbolo-azul-escuro.png',
    escuro: 'simbolo-laranja.png',
  };
  const choices = [...document.querySelectorAll('.lab-choice')];
  choices.forEach(button => button.addEventListener('click', () => {
    choices.forEach(element => element.classList.toggle('active', element === button));
    const theme = button.dataset.lab;
    const preview = document.getElementById('labPreview');
    preview.dataset.labPreview = theme;
    preview.querySelector('.lab-logo').src = '/assets/logos/' + iconNames[theme];
  }));
}
