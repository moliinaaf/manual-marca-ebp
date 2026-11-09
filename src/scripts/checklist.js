/** Live progress meter for the publication checklist. */
export function initChecklist() {
  const fields = [...document.querySelectorAll('.checklist-grid input')];
  fields.forEach(field => field.addEventListener('change', () => {
    const checked = fields.filter(item => item.checked).length;
    const percent = Math.round(checked * 100 / fields.length);
    document.getElementById('checkLabel').textContent = checked + ' de ' + fields.length + ' itens verificados';
    document.getElementById('checkPercent').textContent = percent + '%';
    document.getElementById('checkTrack').style.width = percent + '%';
  }));
}
