let people = []; // { id, name, available, assigned }
let tasks = [];  // { id, name, duration, assignedTo, completed }
let nextPersonId = 1;
let nextTaskId = 1;

// Persistence
function save() {
    localStorage.setItem('scheduler_people', JSON.stringify(people));
    localStorage.setItem('scheduler_tasks', JSON.stringify(tasks));
    localStorage.setItem('scheduler_nextPersonId', String(nextPersonId));
    localStorage.setItem('scheduler_nextTaskId', String(nextTaskId));
}

function load() {
    const p = localStorage.getItem('scheduler_people');
    const t = localStorage.getItem('scheduler_tasks');
    if (p) people = JSON.parse(p);
    if (t) tasks = JSON.parse(t);
    nextPersonId = parseInt(localStorage.getItem('scheduler_nextPersonId') || '1');
    nextTaskId = parseInt(localStorage.getItem('scheduler_nextTaskId') || '1');
}

// Workload-balanced assignment: pick the least-loaded person who still has capacity
function pickAssignee(duration) {
    if (people.length === 0) return null;
    let eligible = people.filter(p => p.assigned + duration <= p.available);
    if (eligible.length === 0) eligible = [...people]; // fallback: ignore cap
    eligible.sort((a, b) => a.assigned - b.assigned);
    return eligible[0];
}

function addPerson(event) {
    event.preventDefault();
    const nameInput = document.getElementById('person-name');
    const availInput = document.getElementById('person-availability');
    const name = nameInput.value.trim();
    const available = parseInt(availInput.value) || 40;
    if (!name) return;

    people.push({ id: nextPersonId++, name, available, assigned: 0 });
    nameInput.value = '';
    availInput.value = '40';
    save();
    renderPeople();
}

function deletePerson(id) {
    const person = people.find(p => p.id === id);
    if (!person) return;

    people = people.filter(p => p.id !== id);

    // Reset assigned hours for remaining people
    people.forEach(p => { p.assigned = 0; });

    // Mark tasks that belonged to deleted person as unassigned, then reassign all
    tasks.forEach(t => {
        if (t.assignedTo === person.name) t.assignedTo = null;
    });

    tasks.forEach(t => {
        if (t.completed) return;
        if (!t.assignedTo) {
            const assignee = pickAssignee(t.duration);
            if (assignee) { t.assignedTo = assignee.name; assignee.assigned += t.duration; }
        } else {
            const p = people.find(p => p.name === t.assignedTo);
            if (p) p.assigned += t.duration;
        }
    });

    save();
    renderPeople();
    renderTasks();
}

function addTask(event) {
    event.preventDefault();
    if (people.length === 0) { alert('Add at least one person first.'); return; }

    const nameInput = document.getElementById('task-name');
    const durationInput = document.getElementById('task-duration');
    const name = nameInput.value.trim();
    const duration = parseInt(durationInput.value);
    if (!name || !duration || isNaN(duration)) return;

    const assignee = pickAssignee(duration);
    assignee.assigned += duration;
    tasks.push({ id: nextTaskId++, name, duration, assignedTo: assignee.name, completed: false });

    nameInput.value = '';
    durationInput.value = '';
    save();
    renderPeople();
    renderTasks();
}

function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (!task.completed) {
        const person = people.find(p => p.name === task.assignedTo);
        if (person) person.assigned -= task.duration;
    }

    tasks = tasks.filter(t => t.id !== id);
    save();
    renderPeople();
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;

    const person = people.find(p => p.name === task.assignedTo);
    if (person) {
        person.assigned += task.completed ? -task.duration : task.duration;
    }

    save();
    renderPeople();
    renderTasks();
}

function renderPeople() {
    const list = document.getElementById('people-list');
    const container = document.getElementById('people-container');

    if (people.length === 0) { container.style.display = 'none'; list.innerHTML = ''; return; }
    container.style.display = 'block';

    list.innerHTML = '';
    people.forEach(p => {
        const pct = Math.min(100, Math.round((p.assigned / p.available) * 100));
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="person-info">
                <span class="person-name">${p.name}</span>
                <span class="person-hours">${p.assigned}h / ${p.available}h</span>
            </div>
            <div class="capacity-bar"><div class="capacity-fill ${pct >= 100 ? 'full' : ''}" style="width:${pct}%"></div></div>
            <button class="delete-btn" onclick="deletePerson(${p.id})">✕</button>
        `;
        list.appendChild(li);
    });
}

function renderTasks() {
    const list = document.getElementById('task-list');
    const container = document.getElementById('task-container');
    const actions = document.getElementById('actions');

    if (tasks.length === 0) { container.style.display = 'none'; list.innerHTML = ''; actions.style.display = 'none'; return; }
    container.style.display = 'block';
    actions.style.display = 'flex';

    list.innerHTML = '';
    tasks.forEach(t => {
        const li = document.createElement('li');
        if (t.completed) li.classList.add('completed');
        li.innerHTML = `
            <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask(${t.id})">
            <span class="task-info">${t.assignedTo || 'Unassigned'}: ${t.name} (${t.duration}h)</span>
            <button class="delete-btn" onclick="deleteTask(${t.id})">✕</button>
        `;
        list.appendChild(li);
    });
}

function clearAll() {
    if (!confirm('Clear all people and tasks?')) return;
    people = []; tasks = []; nextPersonId = 1; nextTaskId = 1;
    localStorage.clear();
    renderPeople();
    renderTasks();
}

document.getElementById('people-form').addEventListener('submit', addPerson);
document.getElementById('task-form').addEventListener('submit', addTask);

load();
renderPeople();
renderTasks();
