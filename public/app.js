const api = "/api/books";

const form = document.querySelector("#bookForm");
const formTitle = document.querySelector("#formTitle");
const formMessage = document.querySelector("#formMessage");
const submitButton = document.querySelector("#submitButton");
const cancelEditButton = document.querySelector("#cancelEditButton");
const refreshButton = document.querySelector("#refreshButton");
const bookList = document.querySelector("#bookList");
const emptyState = document.querySelector("#emptyState");
const bookCounter = document.querySelector("#bookCounter");
const template = document.querySelector("#bookTemplate");

const fields = {
  id: document.querySelector("#bookId"),
  title: document.querySelector("#title"),
  author: document.querySelector("#author"),
  description: document.querySelector("#description"),
  isFavorite: document.querySelector("#isFavorite"),
  isReading: document.querySelector("#isReading"),
  isFinished: document.querySelector("#isFinished")
};

function getPayload() {
  return {
    title: fields.title.value.trim(),
    author: fields.author.value.trim(),
    description: fields.description.value.trim(),
    isFavorite: fields.isFavorite.checked,
    isReading: fields.isReading.checked,
    isFinished: fields.isFinished.checked
  };
}

function setMessage(text, isError = false) {
  formMessage.textContent = text;
  formMessage.classList.toggle("error", isError);
}

function resetForm() {
  form.reset();
  fields.id.value = "";
  formTitle.textContent = "Novo livro";
  submitButton.textContent = "Salvar livro";
  cancelEditButton.classList.add("hidden");
  setMessage("");
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "A API retornou um erro.");
  }

  return data;
}

function createBadge(text, className) {
  const badge = document.createElement("span");
  badge.className = `badge ${className}`;
  badge.textContent = text;
  return badge;
}

function renderBooks(books) {
  bookList.innerHTML = "";
  bookCounter.textContent = books.length;
  emptyState.classList.toggle("hidden", books.length > 0);

  books.forEach((book) => {
    const item = template.content.cloneNode(true);
    const card = item.querySelector(".book-card");
    const badges = item.querySelector(".badges");

    item.querySelector(".book-title").textContent = book.title;
    item.querySelector(".book-author").textContent = book.author;
    item.querySelector(".book-description").textContent = book.description;

    if (book.isFavorite) badges.append(createBadge("Favorito", "favorite"));
    if (book.isReading) badges.append(createBadge("Lendo", "reading"));
    if (book.isFinished) badges.append(createBadge("Finalizado", "finished"));
    if (!badges.children.length) badges.append(createBadge("Sem status", ""));

    item.querySelector(".edit-button").addEventListener("click", () => startEdit(book));
    item.querySelector(".delete-button").addEventListener("click", () => deleteBook(book.id));
    bookList.append(card);
  });
}

async function loadBooks() {
  refreshButton.disabled = true;

  try {
    const books = await requestJson(api);
    renderBooks(books);
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    refreshButton.disabled = false;
  }
}

function startEdit(book) {
  fields.id.value = book.id;
  fields.title.value = book.title;
  fields.author.value = book.author;
  fields.description.value = book.description;
  fields.isFavorite.checked = Boolean(book.isFavorite);
  fields.isReading.checked = Boolean(book.isReading);
  fields.isFinished.checked = Boolean(book.isFinished);
  formTitle.textContent = "Editar livro";
  submitButton.textContent = "Atualizar livro";
  cancelEditButton.classList.remove("hidden");
  setMessage("");
  fields.title.focus();
}

async function saveBook(event) {
  event.preventDefault();

  const payload = getPayload();
  const editingId = fields.id.value;
  const url = editingId ? `${api}/${editingId}` : api;
  const method = editingId ? "PATCH" : "POST";

  submitButton.disabled = true;

  try {
    const data = await requestJson(url, {
      method,
      body: JSON.stringify(payload)
    });

    setMessage(data?.message || "Livro salvo com sucesso.");
    resetForm();
    await loadBooks();
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteBook(id) {
  const confirmed = window.confirm("Excluir este livro?");

  if (!confirmed) return;

  try {
    const data = await requestJson(`${api}/${id}`, { method: "DELETE" });
    setMessage(data?.message || "Livro excluido com sucesso.");
    await loadBooks();
  } catch (error) {
    setMessage(error.message, true);
  }
}

form.addEventListener("submit", saveBook);
cancelEditButton.addEventListener("click", resetForm);
refreshButton.addEventListener("click", loadBooks);

loadBooks();
