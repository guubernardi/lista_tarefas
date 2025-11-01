// ===== Config & util =====
const KEY = '@listaTarefas';

// Gera IDs estáveis (UUID se disponível, fallback para timestamp+rand)
function newId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Leitura segura do localStorage com migração do formato antigo (array de strings)
function loadTarefas() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);

    // Formato novo: array de objetos {id, text, done, createdAt}
    if (Array.isArray(data) && data.every(x => typeof x === 'object' && x !== null && 'text' in x)) {
      return data;
    }

    // Formato antigo: array de strings -> migra
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

// ===== Estado =====
let tarefas = loadTarefas();

// ===== DOM =====
const form         = document.querySelector('#todo-form');
const input        = document.querySelector('#todo-input');
const list         = document.querySelector('#lista');
const emptyState   = document.querySelector('#empty');
const summaryEl    = document.querySelector('#summary');

// ===== Render =====
function render() {
  const frag = document.createDocumentFragment();

  tarefas.forEach(item => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = item.id;

    const box = document.createElement('label');
    box.className = 'todo-box';
    box.setAttribute('aria-label', 'Tarefa');

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!item.done;

    const text = document.createElement('span');
    text.className = 'todo-text' + (item.done ? ' done' : '');
    text.textContent = item.text;

    box.append(cb, text);

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn-danger';
    del.dataset.action = 'delete';
    del.textContent = 'Excluir';

    li.append(box, del);
    frag.appendChild(li);
  });

  list.replaceChildren(frag);

  const total = tarefas.length;
  const done  = tarefas.filter(t => t.done).length;
  summaryEl.textContent = `${done} concluída${done !== 1 ? 's' : ''} de ${total}`;

  // Empty state
  emptyState.hidden = total !== 0;
}

// ===== Ações =====
function addTask(text) {
  const t = text.trim();
  if (!t) {
    input.focus();
    return;
  }
  tarefas.push({ id: newId(), text: t, done: false, createdAt: Date.now() });
  saveTarefas(tarefas);
  input.value = '';
  render();
}

function deleteTask(id) {
  const idx = tarefas.findIndex(t => t.id === id);
  if (idx >= 0) {
    tarefas.splice(idx, 1);
    saveTarefas(tarefas);
    render();
  }
}

function toggleDone(id, value) {
  const item = tarefas.find(t => t.id === id);
  if (item) {
    item.done = !!value;
    saveTarefas(tarefas);
    render();
  }
}

// ===== Event delegation =====
// Submit do form (Enter ou botão)
form.addEventListener('submit', (e) => {
  e.preventDefault();
  addTask(input.value);
});

// Clique em "Excluir" usando delegação
list.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="delete"]');
  if (!btn) return;
  const li = btn.closest('li.todo-item');
  if (!li) return;
  deleteTask(li.dataset.id);
});

// Mudança de checkbox usando delegação
list.addEventListener('change', (e) => {
  if (e.target.matches('input[type="checkbox"]')) {
    const li = e.target.closest('li.todo-item');
    if (!li) return;
    toggleDone(li.dataset.id, e.target.checked);
  }
});

// (Opcional) Editar título com duplo clique
list.addEventListener('dblclick', (e) => {
  const textEl = e.target.closest('.todo-text');
  if (!textEl) return;
  const li = textEl.closest('li.todo-item');
  if (!li) return;

  const id = li.dataset.id;
  const original = textEl.textContent;

  // Torna editável
  textEl.contentEditable = 'true';
  textEl.focus();

  // Seleciona o fim do texto
  document.getSelection()?.collapse(textEl, 1);

  function finish(commit) {
    textEl.contentEditable = 'false';
    textEl.removeEventListener('blur', onBlur);
    textEl.removeEventListener('keydown', onKey);

    if (commit) {
      const value = textEl.textContent.trim();
      if (!value) { textEl.textContent = original; return; }
      const item = tarefas.find(t => t.id === id);
      if (item) {
        item.text = value;
        saveTarefas(tarefas);
        render();
      }
    } else {
      textEl.textContent = original;
    }
  }

  function onBlur() { finish(true); }
  function onKey(ev) {
    if (ev.key === 'Enter') { ev.preventDefault(); finish(true); }
    if (ev.key === 'Escape') { ev.preventDefault(); finish(false); }
  }

  textEl.addEventListener('blur', onBlur);
  textEl.addEventListener('keydown', onKey);
});

// Primeira renderização
render();
