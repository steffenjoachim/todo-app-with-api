const todoInput = document.getElementById("todo-input");
const addButton = document.getElementById("add-btn");
const formContainer = document.getElementById("form-container");
const todosContainer = document.querySelector(".todos-container");
const formWrappers = document.querySelectorAll("form");
const h2Form = document.createElement("h2");
const form = document.createElement("form");
const apiUrl = "http://localhost:3010/todos/";

const radioBtnArray = ["All", "Open", "Done"];
let todos = [];  
let filteredTodos = [];

async function init() {
  let todosData = await getTodos();
  todos = [...todosData]; 
  
  renderForm();
  filterTodos();
  addButton.addEventListener("click", addTodo);
  formWrappers.forEach((form) => {
    form.addEventListener("submit", (event) => event.preventDefault());
  });
}

// Fetch all todos from the API
async function getTodos() {
  const response = await fetch(apiUrl);
  if (response.ok) {
    const todosJson = await response.json();
    return todosJson;
  } else {
    console.error("Error fetching todos:", response.statusText);
    return [];
  }
}

init();

h2Form.textContent = "Filter & Options";
form.classList.add("mbl-2");
form.classList.add("radioForm");

formContainer.appendChild(h2Form);
formContainer.appendChild(form);

// Renders the filter form (All, Open, Done)
function renderForm() {
  form.textContent = "";
  for (let i = 0; i < radioBtnArray.length; i++) {
    const input = createFormInput(i);
    const label = createFormLabel(i, input);
    form.append(input, label);
  }
  const btn = createRemoveBtn();

  const radioBtns = document.querySelectorAll('input[name="filter"]');
  radioBtns.forEach((radio) => {
    radio.addEventListener("change", filterTodos);
  });
}

// ====== Helper functions for form rendering: ======

function createFormLabel(i, input) {
  const label = document.createElement("label");
  label.htmlFor = input.id;
  label.textContent = radioBtnArray[i];
  return label;
}

function createFormInput(i) {
  const input = document.createElement("input");
  input.type = "radio";
  input.name = "filter";
  input.id = radioBtnArray[i].toLowerCase();
  input.value = radioBtnArray[i].toLowerCase();
  if (i === 0) input.checked = true;
  return input;
}

function createRemoveBtn() {
  const btn = document.createElement("button");
  btn.textContent = "Remove Done Todos";
  btn.type = "submit";
  btn.classList.add("mb-2");
  btn.classList.add("btn");
  btn.addEventListener("click", removeDoneTodos);
  formContainer.append(btn);
}

// Render todos in the container
function renderTodos() {
  todosContainer.textContent = "";
  filteredTodos.forEach((todo, i) => {
    const form = createTodoForm();
    const description = createTodoDescription(todo);
    const input = createTodoInput(todo, description);
    form.append(input, description);
    todosContainer.append(form);
  });
}

// ====== Helper functions for rendering todos: ======

function createTodoForm() {
  const form = document.createElement("form");
  form.classList.add("todo");
  return form;
}

function createTodoInput(todo, description) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = todo.done;
  input.id = `todo-checkbox-${todo.id}`;

  input.addEventListener("change", () =>
    markTodoAsDone(todo, input, description)
  );

  return input;
}

function createTodoDescription(todo) {
  const description = document.createElement("label");
  description.textContent = todo.description;
  description.htmlFor = `todo-checkbox-${todo.id}`;
  description.classList.add("radioLabel");

  if (todo.done) description.classList.add("line-through");

  return description;
}

// ====== Function for adding a new todo: ======
async function addTodo(e) {
  const inputValue = todoInput.value.trim();
  
  if (inputValue) {
    const todoExists = await checkIfTodoExists(inputValue);
    
    if (todoExists) {
      alert("This todo already exists!");
      todoInput.value = "";
      return;
    }

    const newTodo = {
      description: inputValue,
      done: false,
    };

    const addedTodo = await postTodo(newTodo);
    
    if (addedTodo) {
      todos.push(addedTodo);
      todoInput.value = "";
      filterTodos();
    }
  } else {
    alert("Please enter a description.");
  }
}

// Post a new todo to the API
async function postTodo(newTodo) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTodo),
  });

  if (response.ok) {
    const addedTodo = await response.json();
    return addedTodo;
  } else {
    console.error("Error posting new todo:", response.statusText);
    return null;
  }
}

// Check if a todo with the same description already exists
function checkIfTodoExists(description) {
  return todos.some(
    (todo) => todo.description.toLowerCase() === description.toLowerCase()
  );
}

// Mark a todo as done and update it in the API
function markTodoAsDone(todo, input, description) {
  todo.done = input.checked;

  if (todo.done) {
    description.classList.add("line-through");
  } else {
    description.classList.remove("line-through");
  }

  updateApi(todo)

  filterTodos();
}

// Update the todo in the API
async function updateApi(todo) {
  const response = await fetch(`${apiUrl}${todo.id}`, {  
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });

  if (!response.ok) {
    console.error("Error updating the todo:", response.statusText);
  }
}

// Remove all "done" todos and delete them from the API
async function removeDoneTodos(e) {
  const todosToBeDeleted = todos.filter((todo) => todo.done);

  for (let i = 0; i < todosToBeDeleted.length; i++) {
    const response = await fetch(`${apiUrl}${todosToBeDeleted[i].id}`, {  
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Error deleting todo with id ${todosToBeDeleted[i].id}:`, response.statusText);
    }
  }

  todos = await getTodos();
  filterTodos();
}

// Filter todos based on the selected radio button (All, Open, Done)
function filterTodos() {
  const selectedFilter = document.querySelector(
    'input[name="filter"]:checked'
  ).value;

  if (selectedFilter === "all") {
    filteredTodos = [...todos];
  } else if (selectedFilter === "open") {
    filteredTodos = todos.filter((todo) => !todo.done);
  } else if (selectedFilter === "done") {
    filteredTodos = todos.filter((todo) => todo.done);
  }
  renderTodos();
}