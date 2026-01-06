/**
 * Flow - Modern Productivity App
 * JavaScript functionality for all features
 */

// ===================================
// App State & Configuration
// ===================================

const APP_STATE = {
    tasks: [],
    notes: [],
    habits: [],
    streak: 0,
    lastActiveDate: null,
    timerSessions: 0,
    theme: 'dark'
};

const STORAGE_KEYS = {
    TASKS: 'flow_tasks',
    NOTES: 'flow_notes',
    HABITS: 'flow_habits',
    STREAK: 'flow_streak',
    LAST_ACTIVE: 'flow_last_active',
    TIMER_SESSIONS: 'flow_timer_sessions',
    THEME: 'flow_theme'
};

const QUOTES = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" }
];

// ===================================
// Utility Functions
// ===================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn('Storage not available:', e);
    }
}

function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.warn('Storage not available:', e);
        return defaultValue;
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
}

function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

// ===================================
// Theme Management
// ===================================

function initTheme() {
    const savedTheme = loadFromStorage(STORAGE_KEYS.THEME, 'dark');
    APP_STATE.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    APP_STATE.theme = APP_STATE.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', APP_STATE.theme);
    saveToStorage(STORAGE_KEYS.THEME, APP_STATE.theme);
}

// ===================================
// Clock & Date
// ===================================

function updateClock() {
    const now = new Date();
    document.getElementById('time').textContent = formatTime(now);
    document.getElementById('date').textContent = formatDate(now);
    document.getElementById('greeting').textContent = getGreeting();
}

// ===================================
// Weather Widget
// ===================================

async function fetchWeather() {
    try {
        // Try to get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await getWeatherData(latitude, longitude);
                },
                () => {
                    // If location denied, show default
                    setDefaultWeather();
                }
            );
        } else {
            setDefaultWeather();
        }
    } catch (error) {
        setDefaultWeather();
    }
}

async function getWeatherData(lat, lon) {
    try {
        // Using Open-Meteo API (free, no API key required)
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
        );
        const data = await response.json();

        if (data.current) {
            const temp = Math.round(data.current.temperature_2m);
            const weatherCode = data.current.weather_code;
            const condition = getWeatherCondition(weatherCode);

            document.getElementById('weatherTemp').textContent = `${temp}°`;
            document.getElementById('weatherCondition').textContent = condition.text;
            updateWeatherIcon(condition.icon);

            // Try to get city name using reverse geocoding
            getCityName(lat, lon);
        }
    } catch (error) {
        setDefaultWeather();
    }
}

async function getCityName(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await response.json();
        const city = data.address?.city || data.address?.town || data.address?.village || 'Your Location';
        document.getElementById('weatherLocation').innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>${city}</span>
        `;
    } catch (error) {
        document.getElementById('weatherLocation').innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Your Location</span>
        `;
    }
}

function getWeatherCondition(code) {
    const conditions = {
        0: { text: 'Clear sky', icon: 'sunny' },
        1: { text: 'Mainly clear', icon: 'sunny' },
        2: { text: 'Partly cloudy', icon: 'cloudy' },
        3: { text: 'Overcast', icon: 'cloudy' },
        45: { text: 'Foggy', icon: 'cloudy' },
        48: { text: 'Depositing rime fog', icon: 'cloudy' },
        51: { text: 'Light drizzle', icon: 'rainy' },
        53: { text: 'Moderate drizzle', icon: 'rainy' },
        55: { text: 'Dense drizzle', icon: 'rainy' },
        61: { text: 'Slight rain', icon: 'rainy' },
        63: { text: 'Moderate rain', icon: 'rainy' },
        65: { text: 'Heavy rain', icon: 'rainy' },
        71: { text: 'Slight snow', icon: 'snowy' },
        73: { text: 'Moderate snow', icon: 'snowy' },
        75: { text: 'Heavy snow', icon: 'snowy' },
        77: { text: 'Snow grains', icon: 'snowy' },
        80: { text: 'Slight showers', icon: 'rainy' },
        81: { text: 'Moderate showers', icon: 'rainy' },
        82: { text: 'Violent showers', icon: 'rainy' },
        85: { text: 'Slight snow showers', icon: 'snowy' },
        86: { text: 'Heavy snow showers', icon: 'snowy' },
        95: { text: 'Thunderstorm', icon: 'rainy' },
        96: { text: 'Thunderstorm with hail', icon: 'rainy' },
        99: { text: 'Thunderstorm with heavy hail', icon: 'rainy' }
    };
    return conditions[code] || { text: 'Clear', icon: 'sunny' };
}

function updateWeatherIcon(type) {
    const iconEl = document.getElementById('weatherIcon');
    iconEl.className = `weather-icon ${type}`;

    const icons = {
        sunny: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>`,
        cloudy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
        </svg>`,
        rainy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 13v8M8 13v8M12 15v8"/>
            <path d="M18 6h-1.26A8 8 0 1 0 4 14h14a3 3 0 0 0 0-6z"/>
        </svg>`,
        snowy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/>
            <path d="M8 16h.01M8 20h.01M12 18h.01M12 22h.01M16 16h.01M16 20h.01"/>
        </svg>`
    };

    iconEl.innerHTML = icons[type] || icons.sunny;
}

function setDefaultWeather() {
    document.getElementById('weatherTemp').textContent = '22°';
    document.getElementById('weatherCondition').textContent = 'Clear sky';
    document.getElementById('weatherLocation').innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
        </svg>
        <span>Enable location</span>
    `;
}

// ===================================
// Focus Timer
// ===================================

let timerInterval = null;
let timerRunning = false;
let timerDuration = 25 * 60; // 25 minutes in seconds
let timerRemaining = timerDuration;

function initTimer() {
    APP_STATE.timerSessions = loadFromStorage(STORAGE_KEYS.TIMER_SESSIONS, 0);

    // Check if it's a new day
    const today = new Date().toDateString();
    const lastSession = loadFromStorage('flow_timer_date', null);
    if (lastSession !== today) {
        APP_STATE.timerSessions = 0;
        saveToStorage(STORAGE_KEYS.TIMER_SESSIONS, 0);
        saveToStorage('flow_timer_date', today);
    }

    updateTimerDisplay();
    document.getElementById('sessionCount').textContent = APP_STATE.timerSessions;

    // Timer presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (timerRunning) return;

            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            timerDuration = parseInt(btn.dataset.time) * 60;
            timerRemaining = timerDuration;
            updateTimerDisplay();
        });
    });

    // Timer controls
    document.getElementById('timerStart').addEventListener('click', toggleTimer);
    document.getElementById('timerReset').addEventListener('click', resetTimer);
}

function toggleTimer() {
    if (timerRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    timerRunning = true;
    document.getElementById('timerStart').classList.add('running');

    timerInterval = setInterval(() => {
        timerRemaining--;
        updateTimerDisplay();

        if (timerRemaining <= 0) {
            completeTimer();
        }
    }, 1000);
}

function pauseTimer() {
    timerRunning = false;
    document.getElementById('timerStart').classList.remove('running');
    clearInterval(timerInterval);
}

function resetTimer() {
    pauseTimer();
    timerRemaining = timerDuration;
    updateTimerDisplay();
}

function completeTimer() {
    pauseTimer();
    APP_STATE.timerSessions++;
    saveToStorage(STORAGE_KEYS.TIMER_SESSIONS, APP_STATE.timerSessions);
    document.getElementById('sessionCount').textContent = APP_STATE.timerSessions;

    timerRemaining = timerDuration;
    updateTimerDisplay();

    showToast('Focus session complete! Great work! 🎉');

    // Play notification sound if supported
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus Timer', { body: 'Session complete! Time for a break.' });
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerRemaining / 60);
    const seconds = timerRemaining % 60;
    document.getElementById('timerTime').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Update progress ring
    const progress = document.getElementById('timerProgress');
    const circumference = 2 * Math.PI * 45;
    const offset = circumference * (1 - timerRemaining / timerDuration);
    progress.style.strokeDasharray = circumference;
    progress.style.strokeDashoffset = offset;
    progress.style.stroke = `url(#timerGradient)`;

    // Add gradient definition if not exists
    if (!document.getElementById('timerGradient')) {
        const svg = progress.closest('svg');
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#6366f1"/>
                <stop offset="50%" style="stop-color:#8b5cf6"/>
                <stop offset="100%" style="stop-color:#a855f7"/>
            </linearGradient>
        `;
        svg.insertBefore(defs, svg.firstChild);
    }
}

// ===================================
// Tasks
// ===================================

function initTasks() {
    APP_STATE.tasks = loadFromStorage(STORAGE_KEYS.TASKS, []);
    renderTasks();

    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    document.getElementById('addTaskBtn').addEventListener('click', addTask);
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();

    if (!text) return;

    const task = {
        id: generateId(),
        text,
        completed: false,
        createdAt: Date.now()
    };

    APP_STATE.tasks.unshift(task);
    saveToStorage(STORAGE_KEYS.TASKS, APP_STATE.tasks);
    input.value = '';

    renderTasks();
    showToast('Task added!');
}

function toggleTask(id) {
    const task = APP_STATE.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveToStorage(STORAGE_KEYS.TASKS, APP_STATE.tasks);
        renderTasks();

        if (task.completed) {
            showToast('Task completed! 🎉');
        }
    }
}

function deleteTask(id) {
    APP_STATE.tasks = APP_STATE.tasks.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.TASKS, APP_STATE.tasks);
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('taskList');
    const empty = document.getElementById('emptyTasks');

    if (APP_STATE.tasks.length === 0) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
    } else {
        empty.classList.add('hidden');
        list.innerHTML = APP_STATE.tasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask('${task.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="task-delete" onclick="deleteTask('${task.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </li>
        `).join('');
    }

    // Update progress
    const completed = APP_STATE.tasks.filter(t => t.completed).length;
    document.getElementById('taskProgress').textContent = `${completed}/${APP_STATE.tasks.length}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================
// Notes
// ===================================

let currentNoteId = null;
let selectedNoteColor = 'default';

function initNotes() {
    APP_STATE.notes = loadFromStorage(STORAGE_KEYS.NOTES, []);
    renderNotes();

    document.getElementById('addNoteBtn').addEventListener('click', () => openNoteModal());
    document.getElementById('closeNoteModal').addEventListener('click', closeNoteModal);
    document.getElementById('cancelNote').addEventListener('click', closeNoteModal);
    document.getElementById('saveNote').addEventListener('click', saveNote);

    // Color selection
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedNoteColor = btn.dataset.color;
        });
    });

    // Close modal on overlay click
    document.getElementById('noteModal').addEventListener('click', (e) => {
        if (e.target.id === 'noteModal') closeNoteModal();
    });
}

function openNoteModal(noteId = null) {
    const modal = document.getElementById('noteModal');
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');

    currentNoteId = noteId;

    if (noteId) {
        const note = APP_STATE.notes.find(n => n.id === noteId);
        if (note) {
            document.getElementById('noteModalTitle').textContent = 'Edit Note';
            titleInput.value = note.title;
            contentInput.value = note.content;
            selectedNoteColor = note.color;

            document.querySelectorAll('.color-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.color === note.color);
            });
        }
    } else {
        document.getElementById('noteModalTitle').textContent = 'New Note';
        titleInput.value = '';
        contentInput.value = '';
        selectedNoteColor = 'default';
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === 'default');
        });
    }

    modal.classList.add('active');
    titleInput.focus();
}

function closeNoteModal() {
    document.getElementById('noteModal').classList.remove('active');
    currentNoteId = null;
}

function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();

    if (!title && !content) {
        showToast('Please add a title or content');
        return;
    }

    if (currentNoteId) {
        const note = APP_STATE.notes.find(n => n.id === currentNoteId);
        if (note) {
            note.title = title || 'Untitled';
            note.content = content;
            note.color = selectedNoteColor;
            note.updatedAt = Date.now();
        }
    } else {
        const note = {
            id: generateId(),
            title: title || 'Untitled',
            content,
            color: selectedNoteColor,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        APP_STATE.notes.unshift(note);
    }

    saveToStorage(STORAGE_KEYS.NOTES, APP_STATE.notes);
    renderNotes();
    closeNoteModal();
    showToast(currentNoteId ? 'Note updated!' : 'Note saved!');
}

function deleteNote(id, event) {
    event.stopPropagation();
    APP_STATE.notes = APP_STATE.notes.filter(n => n.id !== id);
    saveToStorage(STORAGE_KEYS.NOTES, APP_STATE.notes);
    renderNotes();
    showToast('Note deleted');
}

function renderNotes() {
    const grid = document.getElementById('notesGrid');
    const empty = document.getElementById('emptyNotes');

    if (APP_STATE.notes.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
    } else {
        empty.classList.add('hidden');
        grid.innerHTML = APP_STATE.notes.map(note => `
            <div class="note-card ${note.color}" onclick="openNoteModal('${note.id}')">
                <button class="note-delete" onclick="deleteNote('${note.id}', event)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                <div class="note-title">${escapeHtml(note.title)}</div>
                <div class="note-content">${escapeHtml(note.content)}</div>
            </div>
        `).join('');
    }
}

// ===================================
// Habits
// ===================================

let selectedHabitIcon = '💧';

function initHabits() {
    APP_STATE.habits = loadFromStorage(STORAGE_KEYS.HABITS, []);

    // Reset habits if it's a new day
    const today = new Date().toDateString();
    const lastHabitDate = loadFromStorage('flow_habit_date', null);

    if (lastHabitDate !== today) {
        APP_STATE.habits.forEach(h => h.completed = false);
        saveToStorage(STORAGE_KEYS.HABITS, APP_STATE.habits);
        saveToStorage('flow_habit_date', today);
    }

    renderHabits();

    document.getElementById('addHabitBtn').addEventListener('click', openHabitModal);
    document.getElementById('closeHabitModal').addEventListener('click', closeHabitModal);
    document.getElementById('cancelHabit').addEventListener('click', closeHabitModal);
    document.getElementById('saveHabit').addEventListener('click', saveHabit);

    // Icon selection
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedHabitIcon = btn.dataset.icon;
        });
    });

    // Close modal on overlay click
    document.getElementById('habitModal').addEventListener('click', (e) => {
        if (e.target.id === 'habitModal') closeHabitModal();
    });
}

function openHabitModal() {
    const modal = document.getElementById('habitModal');
    document.getElementById('habitName').value = '';
    selectedHabitIcon = '💧';
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.icon === '💧');
    });
    modal.classList.add('active');
    document.getElementById('habitName').focus();
}

function closeHabitModal() {
    document.getElementById('habitModal').classList.remove('active');
}

function saveHabit() {
    const name = document.getElementById('habitName').value.trim();

    if (!name) {
        showToast('Please enter a habit name');
        return;
    }

    const habit = {
        id: generateId(),
        name,
        icon: selectedHabitIcon,
        completed: false,
        createdAt: Date.now()
    };

    APP_STATE.habits.push(habit);
    saveToStorage(STORAGE_KEYS.HABITS, APP_STATE.habits);
    renderHabits();
    closeHabitModal();
    showToast('Habit added!');
}

function toggleHabit(id) {
    const habit = APP_STATE.habits.find(h => h.id === id);
    if (habit) {
        habit.completed = !habit.completed;
        saveToStorage(STORAGE_KEYS.HABITS, APP_STATE.habits);
        renderHabits();
        updateStreak();

        if (habit.completed) {
            showToast('Keep it up! 💪');
        }
    }
}

function deleteHabit(id) {
    APP_STATE.habits = APP_STATE.habits.filter(h => h.id !== id);
    saveToStorage(STORAGE_KEYS.HABITS, APP_STATE.habits);
    renderHabits();
}

function renderHabits() {
    const list = document.getElementById('habitsList');
    const empty = document.getElementById('emptyHabits');

    if (APP_STATE.habits.length === 0) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
    } else {
        empty.classList.add('hidden');
        list.innerHTML = APP_STATE.habits.map(habit => `
            <div class="habit-item" data-id="${habit.id}">
                <span class="habit-icon">${habit.icon}</span>
                <span class="habit-name">${escapeHtml(habit.name)}</span>
                <div class="habit-check ${habit.completed ? 'checked' : ''}" onclick="toggleHabit('${habit.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <button class="habit-delete" onclick="deleteHabit('${habit.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }
}

// ===================================
// Streak
// ===================================

function initStreak() {
    APP_STATE.streak = loadFromStorage(STORAGE_KEYS.STREAK, 0);
    APP_STATE.lastActiveDate = loadFromStorage(STORAGE_KEYS.LAST_ACTIVE, null);

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (APP_STATE.lastActiveDate !== today && APP_STATE.lastActiveDate !== yesterday) {
        // Streak broken
        APP_STATE.streak = 0;
    }

    updateStreakDisplay();
}

function updateStreak() {
    const today = new Date().toDateString();
    const allHabitsComplete = APP_STATE.habits.length > 0 &&
        APP_STATE.habits.every(h => h.completed);

    if (allHabitsComplete) {
        if (APP_STATE.lastActiveDate !== today) {
            APP_STATE.streak++;
            APP_STATE.lastActiveDate = today;
            saveToStorage(STORAGE_KEYS.STREAK, APP_STATE.streak);
            saveToStorage(STORAGE_KEYS.LAST_ACTIVE, APP_STATE.lastActiveDate);
        }
    }

    updateStreakDisplay();
}

function updateStreakDisplay() {
    document.getElementById('streakCount').textContent = APP_STATE.streak;

    const messages = [
        { min: 0, max: 0, text: 'Start your journey!' },
        { min: 1, max: 2, text: 'Great start!' },
        { min: 3, max: 6, text: 'Building momentum!' },
        { min: 7, max: 13, text: 'One week strong!' },
        { min: 14, max: 29, text: 'Unstoppable!' },
        { min: 30, max: 59, text: 'Habit master!' },
        { min: 60, max: Infinity, text: 'Legendary!' }
    ];

    const message = messages.find(m => APP_STATE.streak >= m.min && APP_STATE.streak <= m.max);
    document.getElementById('streakMessage').textContent = message?.text || 'Keep going!';
}

// ===================================
// Quotes
// ===================================

function initQuotes() {
    displayRandomQuote();
    document.getElementById('refreshQuote').addEventListener('click', displayRandomQuote);
}

function displayRandomQuote() {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    document.getElementById('quoteText').textContent = quote.text;
    document.getElementById('quoteAuthor').textContent = quote.author;
}

// ===================================
// Keyboard Shortcuts
// ===================================

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Escape to close modals
        if (e.key === 'Escape') {
            closeNoteModal();
            closeHabitModal();
        }

        // Ctrl/Cmd + N for new task (when not in input)
        if ((e.ctrlKey || e.metaKey) && e.key === 'n' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            document.getElementById('taskInput').focus();
        }

        // Space to start/pause timer (when not in input)
        if (e.key === ' ' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            toggleTimer();
        }
    });
}

// ===================================
// Request Notification Permission
// ===================================

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ===================================
// Initialize App
// ===================================

function initApp() {
    initTheme();
    updateClock();
    setInterval(updateClock, 1000);

    fetchWeather();
    initTimer();
    initTasks();
    initNotes();
    initHabits();
    initStreak();
    initQuotes();
    initKeyboardShortcuts();
    requestNotificationPermission();

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    console.log('🚀 Flow app initialized!');
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);
