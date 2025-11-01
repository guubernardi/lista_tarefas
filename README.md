Lista de Tarefas

Pequeno app de To-Do feito com HTML + CSS + JavaScript puro, salvando tudo no localStorage.
Inclui IDs estáveis, checkbox de concluída, exclusão, delegação de eventos e migração automática do formato antigo (array de strings) para o formato novo (objetos).

✨ Funcionalidades

Adicionar tarefas

Marcar como concluída

Excluir tarefas

Contador “X concluídas de Y”

Estado vazio (“Sem tarefas ainda”)

Persistência em localStorage

Migração automática do storage antigo (strings) → novo (objetos)

Delegação de eventos (performático com listas grandes)

🧱 Stack

Front: HTML, CSS, JavaScript (ES6+)

Armazenamento: localStorage do navegador

📂 Estrutura de pastas
.
├─ index.html      # Estrutura da página
├─ script.js       # Lógica da aplicação
├─ README.md       # Este arquivo :)

🧠 Como funciona (resumo técnico)

As tarefas vivem num array tarefas com objetos assim:

{
  id: "uuid-ou-timestamp",
  text: "Comprar pão",
  done: false,
  createdAt: 1730440000000
}


IDs estáveis: gerados com crypto.randomUUID() (quando disponível) ou fallback com timestamp+rand.

Migração automática: se o localStorage tiver um array de strings (formato antigo), o app converte para o formato de objetos na primeira execução.

Delegação de eventos: um único listener na <ul> lida com “excluir” e “toggle” das tarefas.

Renderização: usa DocumentFragment e replaceChildren pra render eficiente.

🧩 Código principal (trecho)
const KEY = '@listaTarefas';

function newId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadTarefas() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.every(x => typeof x === 'object' && x !== null && 'text' in x)) {
      return data;
    }
    if (Array.isArray(data) && data.every(x => typeof x === 'string')) {
      return data.map(text => ({ id: newId(), text, done: false, createdAt: Date.now() }));
    }
    return [];
  } catch {
    return [];
  }
}
function saveTarefas(tarefas) {
  localStorage.setItem(KEY, JSON.stringify(tarefas));
}

O restante do código (render, add, delete, toggle, edição inline) está no script.js.

🤝 Contribuindo

Faça um fork

Crie uma branch: git checkout -b feat/filtro-concluidas

Faça commits claros: git commit -m "feat: filtro por concluídas"

Envie: git push origin feat/filtro-concluidas

Abra um Pull Request explicando o que mudou (e, se possível, anexando um GIF curto)

Melhorias de código são bem-vindas. Explique o “porquê” da mudança no PR — facilita revisão e traz pontos de aprendizado pra todo mundo.

📄 Licença

MIT — use, modifique e distribua com liberdade.
Considere manter os créditos se este projeto te ajudou. 💙

💬 Contato: gubernardi@hotmail.com

Encontrou um bug? Tem uma ideia massa pra melhorar?
Abra uma Issue ou mande um PR — curto discussões técnicas e feedbacks sinceros.
