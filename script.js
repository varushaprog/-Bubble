//Состояние и «база данных»
let habits = JSON.parse(localStorage.getItem('bubble_habits') || '[]');
let nextId = habits.length ? Math.max(...habits.map(h => h.id)) + 1 : 1;
let selectedId = null;

const $ = (id) => document.getElementById(id);

function saveDB() {
    localStorage.setItem('bubble_habits', JSON.stringify(habits));
}

//Тосты
let toastTimer;
function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
}

$('createBtn').addEventListener('click', () => {
    $('newName').value = '';
    $('newDuration').value = 30;
    showModal('createModal');
});

$('viewBtn').addEventListener('click', () => {
    $('mainScreen').classList.add('hidden');
    $('cardsScreen').classList.remove('hidden');
    selectedId = null;
    renderList();
});

$('backBtn').addEventListener('click', () => {
    $('cardsScreen').classList.add('hidden');
    $('mainScreen').classList.remove('hidden');
});

function showModal(id) { $(id).classList.remove('hidden'); }
function hideModal(id) { $(id).classList.add('hidden'); }

document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => hideModal(btn.dataset.close));
});

// Закрытие по клику на фон
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.add('hidden');
    });
});

//Создание привычки
$('saveHabitBtn').addEventListener('click', () => {
    const name = $('newName').value.trim();
    const duration = parseInt($('newDuration').value, 10);

    if (!name) return toast('Введите название привычки');
    if (isNaN(duration) || duration < 1) return toast('Укажите длительность');

    habits.push({
        id: nextId++,
        name,
        duration,
        marks: {}
    });
    saveDB();
    hideModal('createModal');
    toast('Привычка добавлена!');
});

//Список
function renderList(filter = '') {
    const list = $('habitList');
    list.innerHTML = '';

    const filtered = habits.filter(h =>
        h.name.toLowerCase().includes(filter.toLowerCase())
    );

    $('emptyMsg').classList.toggle('hidden', filtered.length > 0);

    filtered.forEach(h => {
        const li = document.createElement('li');
        li.textContent = h.name;
        if (h.id === selectedId) li.classList.add('selected');
        li.addEventListener('click', () => {
            selectedId = h.id;
            renderList(filter);
        });
        list.appendChild(li);
    });
}

$('searchBtn').addEventListener('click', () => {
    renderList($('searchInput').value);
});

$('searchInput').addEventListener('input', (e) => {
    renderList(e.target.value);
});

//Удаление
$('deleteBtn').addEventListener('click', () => {
    if (selectedId === null) return toast('Привычка не выбрана!');
    habits = habits.filter(h => h.id !== selectedId);
    selectedId = null;
    saveDB();
    renderList($('searchInput').value);
    toast('Привычка удалена!');
});

//Редактирование
$('editBtn').addEventListener('click', () => {
    if (selectedId === null) return toast('Привычка не выбрана!');
    const h = habits.find(x => x.id === selectedId);
    $('editName').value = h.name;
    $('editDuration').value = h.duration;
    showModal('editModal');
});

$('updateHabitBtn').addEventListener('click', () => {
    const name = $('editName').value.trim();
    const duration = parseInt($('editDuration').value, 10);

    if (!name) return toast('Введите название');
    if (isNaN(duration) || duration < 1) return toast('Укажите длительность');

    const h = habits.find(x => x.id === selectedId);
    h.name = name;
    h.duration = duration;
    saveDB();
    hideModal('editModal');
    renderList($('searchInput').value);
    toast('Привычка изменена!');
});

//Календарь
$('openBtn').addEventListener('click', () => {
    if (selectedId === null) return toast('Привычка не выбрана!');
    const h = habits.find(x => x.id === selectedId);

    $('detailsTitle').textContent = `Детали: ${h.name}`;
    $('detailsName').textContent = h.name;
    $('detailsDuration').textContent = `Длительность: ${h.duration} дн.`;
    showModal('detailsModal');
    renderCalendar(h);
});

function renderCalendar(habit) {
    const cal = $('calendar');
    cal.innerHTML = '';

    const dows = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    dows.forEach(d => {
        const el = document.createElement('div');
        el.className = 'dow';
        el.textContent = d;
        cal.appendChild(el);
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    for (let i = 0; i < startOffset; i++) {
        cal.appendChild(document.createElement('div'));
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const cell = document.createElement('div');
        cell.className = 'day';
        cell.textContent = d;

        if (habit.marks[dateKey]) cell.classList.add('marked');

        cell.addEventListener('click', () => {
            if (habit.marks[dateKey]) {
                delete habit.marks[dateKey];
                cell.classList.remove('marked');
            } else {
                habit.marks[dateKey] = true;
                cell.classList.add('marked');
            }
            saveDB();
        });

        cal.appendChild(cell);
    }
}

// Инициализация
renderList();