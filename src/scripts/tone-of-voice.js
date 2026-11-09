/** Guia interativo de tom de voz com exemplos fiéis ao conteúdo do manual. */
export function initToneOfVoice() {
  const workspace = document.getElementById('toneWorkbench');
  if (!workspace) return;
  const buttons = [...workspace.querySelectorAll('[data-tone]')];
  const panel = document.getElementById('tone-panel');
  const topic = document.getElementById('toneTopic');
  const description = document.getElementById('toneDescription');
  const good = document.getElementById('toneGood');
  const bad = document.getElementById('toneBad');
  const note = document.getElementById('toneNote');
  const options = [
    {
      title: 'OBJETIVIDADE',
      description: 'Explique a ação sem exageros ou frases vagas.',
      good: '“Você pode indicar clientes interessados nas soluções da EletroBidu.”',
      bad: '“Faça já sua indicação e transforme tudo!”',
      note: 'A mensagem deve dizer o que a pessoa pode fazer, sem dramatização.'
    },
    {
      title: 'RELACIONAMENTO',
      description: 'Seja próximo e informativo, preservando o profissionalismo.',
      good: '“Nossa equipe realiza o atendimento e acompanha as próximas etapas.”',
      bad: '“Manda aí que a gente resolve tudo, fechou?”',
      note: 'Converse naturalmente e dê informações claras sobre o atendimento.'
    },
    {
      title: 'CREDIBILIDADE',
      description: 'Use benefícios reais e condições verificáveis.',
      good: '“A comissão segue as condições vigentes do programa.”',
      bad: '“Ganhos ilimitados e 100% garantidos.”',
      note: 'Nunca prometa valores ou resultados sem regras confirmadas.'
    }
  ];
  function select(index, shouldFocus = false) {
    const item = options[index];
    if (!item) return;
    topic.textContent = item.title;
    description.textContent = item.description;
    good.textContent = item.good;
    bad.textContent = item.bad;
    note.textContent = item.note;
    panel.setAttribute('aria-labelledby', `tone-tab-${index}`);
    buttons.forEach((btn, i) => {
      const selected = i === index;
      btn.classList.toggle('is-active', selected);
      btn.setAttribute('aria-selected', String(selected));
      btn.tabIndex = selected ? 0 : -1;
    });
    if (shouldFocus) buttons[index].focus();
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % options.length
        : event.key === 'ArrowLeft' ? (index - 1 + options.length) % options.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : null;
      if (next === null) return;
      event.preventDefault();
      select(next, true);
    });
  });
  select(0);
}
