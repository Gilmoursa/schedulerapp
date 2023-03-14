const people = ['person 1', 'person 2', 'person 3', 'person 4', 'person 5'];
let tasks = [];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function addTask(event) {
  event.preventDefault();
  const nameInput = document.getElementById('task-name');
  const durationInput = document.getElementById('task-duration');
  const name = nameInput.value.trim();
  const duration = parseInt(durationInput.value.trim());
  if (name && duration && !isNaN(duration)) {
    tasks.push({name, duration});
    nameInput.value = '';
    durationInput.value = '';
    displayTasks();
  }
}

function displayTasks() {
  shuffle(people);
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';
  for (let i = 0; i < tasks.length; i++) {
    const li = document.createElement('li');
    const assignedPerson = people[i % people.length];
    li.textContent = `${assignedPerson}: ${tasks[i].name} (${tasks[i].duration} minutes)`;
    taskList.appendChild(li);
  }
}

const taskForm = document.getElementById('task-form');
taskForm.addEventListener('submit', addTask);
