// API Configuration
const API_ENDPOINTS = {
    any: 'https://official-joke-api.appspot.com/random_joke',
    programming: 'https://official-joke-api.appspot.com/jokes/programming/random',
    'knock-knock': 'https://official-joke-api.appspot.com/jokes/knock-knock/random',
    general: 'https://official-joke-api.appspot.com/jokes/general/random'
};

// State Management
const state = {
    currentJoke: null,
    currentCategory: 'any',
    jokeCount: 0,
    history: [],
    favorites: []
};

// DOM Elements
const jokeContent = document.getElementById('jokeContent');
const newJokeBtn = document.getElementById('newJokeBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const favoriteBtn = document.getElementById('favoriteBtn');
const jokeCountDisplay = document.getElementById('jokeCount');
const historyList = document.getElementById('historyList');
const categoryBtns = document.querySelectorAll('.category-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    loadJoke();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    newJokeBtn.addEventListener('click', loadJoke);
    copyBtn.addEventListener('click', copyJoke);
    shareBtn.addEventListener('click', shareJoke);
    favoriteBtn.addEventListener('click', toggleFavorite);

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.currentCategory = e.target.dataset.category;
            loadJoke();
        });
    });
}

// Load Joke from API
async function loadJoke() {
    try {
        newJokeBtn.disabled = true;
        jokeContent.innerHTML = '<p class="loading"><i class="fas fa-spinner fa-spin"></i> Loading a joke...</p>';

        const endpoint = API_ENDPOINTS[state.currentCategory] || API_ENDPOINTS.any;
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error('Failed to fetch joke');
        }

        const data = await response.json();
        state.currentJoke = data;
        state.jokeCount++;

        displayJoke(data);
        addToHistory(data);
        saveState();
        updateStats();

        newJokeBtn.disabled = false;
    } catch (error) {
        console.error('Error loading joke:', error);
        jokeContent.innerHTML = `
            <p style="color: #fa709a;">
                <i class="fas fa-exclamation-circle"></i><br>
                Oops! Failed to load a joke. Please try again.
            </p>
        `;
        newJokeBtn.disabled = false;
    }
}

// Display Joke
function displayJoke(joke) {
    let jokeHTML = '';

    if (joke.setup && joke.delivery) {
        // Two-part joke
        jokeHTML = `
            <p class="joke-setup">${escapeHtml(joke.setup)}</p>
            <p class="joke-delivery">${escapeHtml(joke.delivery)}</p>
        `;
    } else {
        // Single joke
        jokeHTML = `<p>${escapeHtml(joke.joke || 'No joke available')}</p>`;
    }

    jokeContent.innerHTML = jokeHTML;
    updateFavoriteButton();
}

// Add to History
function addToHistory(joke) {
    const jokeText = joke.setup && joke.delivery 
        ? `${joke.setup} - ${joke.delivery}`
        : joke.joke;

    state.history.unshift({
        text: jokeText,
        timestamp: new Date().toLocaleTimeString(),
        category: state.currentCategory
    });

    // Keep only last 10 jokes
    if (state.history.length > 10) {
        state.history.pop();
    }

    updateHistoryDisplay();
}

// Update History Display
function updateHistoryDisplay() {
    if (state.history.length === 0) {
        historyList.innerHTML = '<p class="empty-message">No jokes yet. Start generating!</p>';
        return;
    }

    historyList.innerHTML = state.history.map((item, index) => `
        <div class="history-item" onclick="loadFromHistory(${index})">
            <strong>Joke ${state.history.length - index}:</strong>
            <small>${item.text.substring(0, 50)}...</small>
            <small style="display: block; color: #999; margin-top: 5px;">${item.timestamp}</small>
        </div>
    `).join('');
}

// Load Joke from History
function loadFromHistory(index) {
    const historyJoke = state.history[index];
    const parts = historyJoke.text.split(' - ');
    
    state.currentJoke = {
        setup: parts[0],
        delivery: parts[1] || '',
        joke: historyJoke.text
    };

    displayJoke(state.currentJoke);
    updateFavoriteButton();
}

// Copy Joke to Clipboard
function copyJoke() {
    if (!state.currentJoke) return;

    const jokeText = state.currentJoke.setup && state.currentJoke.delivery
        ? `${state.currentJoke.setup}\n${state.currentJoke.delivery}`
        : state.currentJoke.joke;

    navigator.clipboard.writeText(jokeText).then(() => {
        showNotification('Joke copied to clipboard! 📋');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Share Joke
function shareJoke() {
    if (!state.currentJoke) return;

    const jokeText = state.currentJoke.setup && state.currentJoke.delivery
        ? `${state.currentJoke.setup}\n${state.currentJoke.delivery}`
        : state.currentJoke.joke;

    const shareText = `Check out this joke: ${jokeText}`;

    if (navigator.share) {
        navigator.share({
            title: 'Random Joke',
            text: shareText
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: Copy to clipboard
        copyJoke();
        showNotification('Share functionality not available. Joke copied instead! 📋');
    }
}

// Toggle Favorite
function toggleFavorite() {
    if (!state.currentJoke) return;

    const jokeText = state.currentJoke.setup && state.currentJoke.delivery
        ? `${state.currentJoke.setup} - ${state.currentJoke.delivery}`
        : state.currentJoke.joke;

    const index = state.favorites.findIndex(fav => fav === jokeText);

    if (index > -1) {
        state.favorites.splice(index, 1);
        favoriteBtn.classList.remove('active');
        showNotification('Removed from favorites 💔');
    } else {
        state.favorites.push(jokeText);
        favoriteBtn.classList.add('active');
        showNotification('Added to favorites ❤️');
    }

    saveState();
}

// Update Favorite Button State
function updateFavoriteButton() {
    if (!state.currentJoke) {
        favoriteBtn.classList.remove('active');
        return;
    }

    const jokeText = state.currentJoke.setup && state.currentJoke.delivery
        ? `${state.currentJoke.setup} - ${state.currentJoke.delivery}`
        : state.currentJoke.joke;

    const isFavorite = state.favorites.some(fav => fav === jokeText);
    
    if (isFavorite) {
        favoriteBtn.classList.add('active');
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        favoriteBtn.classList.remove('active');
        favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
    }
}

// Update Stats
function updateStats() {
    jokeCountDisplay.textContent = state.jokeCount;
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// Local Storage Management
function saveState() {
    localStorage.setItem('jokeAppState', JSON.stringify({
        jokeCount: state.jokeCount,
        history: state.history,
        favorites: state.favorites
    }));
}

function loadState() {
    const saved = localStorage.getItem('jokeAppState');
    if (saved) {
        const data = JSON.parse(saved);
        state.jokeCount = data.jokeCount || 0;
        state.history = data.history || [];
        state.favorites = data.favorites || [];
        updateStats();
        updateHistoryDisplay();
    }
}

// Utility: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        loadJoke();
    }
});

// Console Easter Egg
console.log('%c🎉 Welcome to Joke Generator! 🎉', 'font-size: 20px; color: #667eea; font-weight: bold;');
console.log('%cPress SPACEBAR to get a new joke quickly!', 'font-size: 14px; color: #764ba2;');
