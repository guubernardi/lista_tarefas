# ✅ Lista de Tarefas (To-Do)

Aplicação **zero-dependency** (HTML, CSS e JavaScript puro) para criar, concluir e excluir tarefas no navegador, com **persistência em `localStorage`** e design responsivo.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=fff)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=fff)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)
![Status](https://img.shields.io/badge/status-estável-brightgreen)

---

## ✨ Funcionalidades

- **Adicionar tarefas** rapidamente (Enter no campo de texto ou botão “Adicionar”)
- **Concluir/Desmarcar** tarefa com checkbox (atualiza contagem “X concluídas de Y”)
- **Excluir** tarefa individual
- **Persistência local** usando `localStorage` (abre e continua de onde parou)
- **Migração automática** do formato antigo (array de strings) para o **formato novo** `{ id, text, done, createdAt }`
- **IDs estáveis** via `crypto.randomUUID()` com **fallback** seguro
- **Responsivo e acessível** (semântica básica, rótulos clicáveis e foco visível)

---

## 🖼️ Prévia

- **Demo:**(https://guubernardi.github.io/lista_tarefas/)
---

## 🧠 Como funciona (arquitetura simples)

- **Estado**: mantido em um array `tarefas` na memória e salvo em `localStorage` (`@listaTarefas`)
- **Renderização**: função `render()` reconstrói a lista a partir do estado (usa `DocumentFragment` para eficiência)
- **Ações**:
  - `addTask(text)` → insere um objeto `{ id, text, done, createdAt }`
  - `toggleDone(id, value)` → marca/desmarca como concluída
  - `deleteTask(id)` → remove do array e salva
- **Eventos delegados**: clique de exclusão e alteração de checkbox são tratados no `<ul>` (menos *listeners*, mais performance)

---

