(() => {
  const KEY = '@listaTarefas';

  // --- helpers de compatibilidade ---
  function safeReplaceChildren(node, frag) {
    if (node.replaceChildren) node.replaceChildren(frag);
    else { node.innerHTML = ''; node.appendChild(frag); }
  }
  function newId() {
    try {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
    } catch (_) {}
    return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
  }
  function loadTarefas() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.every(x => x && typeof x === 'object' && 'text' in x)) return data;
      if (Array.isArray(data) && data.every(x => typeof x === 'string'))
        return data.map(text => ({ id: newId(), text, done:false, createdAt: Date.now() }));
      return [];
    } catch (err) {
      console.warn('[tarefas] falha ao ler storage:', err);
      return [];
    }
  }
  function saveTarefas(tarefas) {
    try { localStorage.setItem(KEY, JSON.stringify(tarefas)); }
    catch (err) { console.warn('[tarefas] falha ao salvar storage:', err); }
  }

  // --- inicia quando o DOM estiver pronto ---
  document.addEventListener('DOMContentLoaded', () => {
    // pega elementos e valida
    const form      = document.querySelector('#todo-form');
    const input     = document.querySelector('#todo-input');
    const list      = document.querySelector('#lista');
    const empty     = document.querySelector('#empty');
    const summaryEl = document.querySelector('#summary');

    const missing = [
      ['#todo-form',  form],
      ['#todo-input', input],
      ['#lista',      list],
      ['#empty',      empty],
      ['#summary',    summaryEl],
    ].filter(([_, el]) => !el);

    if (missing.length) {
      console.error('Elementos não encontrados no DOM:', missing.map(m => m[0]).join(', '));
      // evita crash silencioso
      return;
    }

    let tarefas = loadTarefas();

    function render() {
      const frag = document.createDocumentFragment();

      tarefas.forEach(item => {
        const li   = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = item.id;

        const box  = document.createElement('label');
        box.className = 'todo-box';
        box.setAttribute('aria-label', 'Tarefa');

        const cb   = document.createElement('input');
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

      safeReplaceChildren(list, frag);

      const total = tarefas.length;
      const done  = tarefas.filter(t => t.done).length;
      summaryEl.textContent = `${done} concluída${done !== 1 ? 's' : ''} de ${total}`;
      empty.hidden = total !== 0;
    }

    function addTask(text) {
      const t = String(text || '').trim();
      if (!t) { input.focus(); return; }
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

    // eventos
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      addTask(input.value);
    });

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action="delete"]');
      if (!btn) return;
      const li = btn.closest('li.todo-item');
      if (li) deleteTask(li.dataset.id);
    });

    list.addEventListener('change', (e) => {
      if (e.target.matches('input[type="checkbox"]')) {
        const li = e.target.closest('li.todo-item');
        if (li) toggleDone(li.dataset.id, e.target.checked);
      }
    });

    render();
  });
})();
