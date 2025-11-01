// Uma "chave" para sabermos onde vamos salvar/ler no localStorage
const KEY = '@listaTarefas';

// Função para criar um ID único para cada tarefa
// (isso ajuda quando há tarefas com o mesmo texto)
function newId() {
  // Tenta usar um gerador de UUID moderno (se o navegador tiver)
  if (crypto?.randomUUID) return crypto.randomUUID();
  // Senão, cria um ID "caseiro" usando data + número aleatório
  return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Lê as tarefas do localStorage com "proteção" (try/catch)
// Também migra do formato antigo (array de strings) para o novo (objetos)
function loadTarefas() {
  try {
    // Pega o texto salvo (se nunca salvou nada, vem null)
    const raw = localStorage.getItem(KEY);
    if (!raw) return []; // se não tem nada salvo ainda, começa vazio

    // Transforma o texto em objeto/array de verdade
    const data = JSON.parse(raw);

    // Caso 1: já está no formato novo (lista de objetos com "text")
    if (Array.isArray(data) && data.every(x => typeof x === 'object' && x !== null && 'text' in x)) {
      return data;
    }

    // Caso 2: formato antigo (lista de strings). Vamos converter para objetos.
    if (Array.isArray(data) && data.every(x => typeof x === 'string')) {
      return data.map(text => ({ id: newId(), text, done: false, createdAt: Date.now() }));
    }

    // Se cair aqui, o que estava salvo não é o que esperamos.
    // Melhor zerar para evitar bugs.
    return [];
  } catch {
    // Se der erro ao ler ou dar JSON.parse, voltamos com lista vazia
    return [];
  }
}

// Salva a lista de tarefas no localStorage (vira texto JSON)
function saveTarefas(tarefas) {
  localStorage.setItem(KEY, JSON.stringify(tarefas));
}

// Aqui guardamos as tarefas em memória enquanto a página está aberta
let tarefas = loadTarefas();

// Pega do HTML as coisas que vamos mexer
const form         = document.querySelector('#todo-form');  // o formulário (input + botão)
const input        = document.querySelector('#todo-input'); // a caixa de digitar a tarefa
const list         = document.querySelector('#lista');      // a lista <ul> onde vão os <li>
const emptyState   = document.querySelector('#empty');      // a mensagem "sem tarefas"
const summaryEl    = document.querySelector('#summary');    // o contador "x de y concluídas"

// Função que desenha a tela usando o que está em "tarefas"
function render() {
  // Criamos um "fragmento" (uma caixinha invisível) para montar tudo fora da tela
  // e só depois colocamos de uma vez. Isso deixa mais rápido e suave.
  const frag = document.createDocumentFragment();

  // Para cada tarefa no array
  tarefas.forEach(item => {
    // Criamos um <li> para representar a tarefa
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = item.id; // guardamos o ID no HTML (data-id) para encontrar depois

    // Esta "box" é um <label> que vai juntar o checkbox e o texto
    const box = document.createElement('label');
    box.className = 'todo-box';
    box.setAttribute('aria-label', 'Tarefa'); // acessibilidade (leitores de tela)

    // O checkbox "marca" a tarefa como concluída
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!item.done; // se done for true, fica marcado

    // O texto da tarefa
    const text = document.createElement('span');
    text.className = 'todo-text' + (item.done ? ' done' : ''); // se concluída, risca o texto
    text.textContent = item.text;

    // Juntamos checkbox + texto dentro do "box"
    box.append(cb, text);

    // Criamos o botão de excluir (vermelhinho)
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn-danger';
    del.dataset.action = 'delete'; // vamos usar esse data-atributo para saber que é "excluir"
    del.textContent = 'Excluir';

    // Colocamos tudo dentro do <li> e o <li> dentro do fragmento
    li.append(box, del);
    frag.appendChild(li);
  });

  // Trocamos o conteúdo da <ul> pelo que montamos no fragmento
  list.replaceChildren(frag);

  // Atualizamos o "resumo": quantas concluídas de quantas no total
  const total = tarefas.length;
  const done  = tarefas.filter(t => t.done).length;
  summaryEl.textContent = `${done} concluída${done !== 1 ? 's' : ''} de ${total}`;

  // Se não tem tarefas, mostramos a mensagem de vazio
  emptyState.hidden = total !== 0;
}

// Adiciona uma nova tarefa com o texto digitado
function addTask(text) {
  const t = text.trim(); // tira espaços extras do começo/fim
  if (!t) {
    // se estiver vazio, só volta o foco pro input e não faz nada
    input.focus();
    return;
  }
  // Monta o objeto da tarefa
  tarefas.push({ id: newId(), text: t, done: false, createdAt: Date.now() });
  // Salva no localStorage
  saveTarefas(tarefas);
  // Limpa o input para digitar outra
  input.value = '';
  // Desenha a tela de novo
  render();
}

// Exclui uma tarefa, procurando pelo ID
function deleteTask(id) {
  // Procura qual é a posição (índice) da tarefa no array
  const idx = tarefas.findIndex(t => t.id === id);
  if (idx >= 0) {
    // Remove 1 item a partir do índice encontrado
    tarefas.splice(idx, 1);
    // Salva a mudança
    saveTarefas(tarefas);
    // Re-renderiza a lista
    render();
  }
}

// Marca/desmarca como concluída (done = true/false)
function toggleDone(id, value) {
  // Acha o objeto da tarefa pelo ID
  const item = tarefas.find(t => t.id === id);
  if (item) {
    item.done = !!value; // garante que vira booleano
    saveTarefas(tarefas);
    render();
  }
}

// Event delegation (Delegação de eventos) 
// Ideia: em vez de colocar um "click" em cada botão de excluir,
// a gente coloca UM "click" na <ul> e descobre quem foi clicado.
// Isso é mais leve quando a lista cresce.

// Quando enviar o formulário (clicar no botão ou apertar Enter)
form.addEventListener('submit', (e) => {
  e.preventDefault();        // impede de recarregar a página
  addTask(input.value);      // chama nossa função de adicionar
});

// Quando clicar em algo dentro da lista...
list.addEventListener('click', (e) => {
  // Verifica se o clique foi num botão com data-action="delete"
  const btn = e.target.closest('button[data-action="delete"]');
  if (!btn) return; // se não foi no botão de excluir, ignoramos

  // Pega o <li> (pai) mais próximo para ler o data-id
  const li = btn.closest('li.todo-item');
  if (!li) return;

  // Exclui pela identificação guardada no data-id
  deleteTask(li.dataset.id);
});

// Quando mudar algum checkbox (marcar/desmarcar concluída)
list.addEventListener('change', (e) => {
  // Só seguimos se o alvo for um input do tipo checkbox
  if (e.target.matches('input[type="checkbox"]')) {
    const li = e.target.closest('li.todo-item');
    if (!li) return;
    // Atualiza o "done" conforme o estado do checkbox
    toggleDone(li.dataset.id, e.target.checked);
  }
});

// Primeira renderização quando a página carrega
render();



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
