/* ==========================================
   World Digital Clock - JavaScript
   =========================================== */

// ==========================================
// Time Zone Data
// ==========================================

const TIMEZONES = [
    // Americas
    { city: 'New York', timezone: 'America/New_York', region: 'Americas' },
    { city: 'Toronto', timezone: 'America/Toronto', region: 'Americas' },
    { city: 'Mexico City', timezone: 'America/Mexico_City', region: 'Americas' },
    { city: 'Los Angeles', timezone: 'America/Los_Angeles', region: 'Americas' },
    { city: 'Denver', timezone: 'America/Denver', region: 'Americas' },
    { city: 'Chicago', timezone: 'America/Chicago', region: 'Americas' },
    { city: 'São Paulo', timezone: 'America/Sao_Paulo', region: 'Americas' },
    { city: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', region: 'Americas' },
    { city: 'Lima', timezone: 'America/Lima', region: 'Americas' },
    { city: 'Anchorage', timezone: 'America/Anchorage', region: 'Americas' },
    { city: 'Honolulu', timezone: 'Pacific/Honolulu', region: 'Americas' },

    // Europe
    { city: 'London', timezone: 'Europe/London', region: 'Europe' },
    { city: 'Paris', timezone: 'Europe/Paris', region: 'Europe' },
    { city: 'Berlin', timezone: 'Europe/Berlin', region: 'Europe' },
    { city: 'Amsterdam', timezone: 'Europe/Amsterdam', region: 'Europe' },
    { city: 'Moscow', timezone: 'Europe/Moscow', region: 'Europe' },
    { city: 'Istanbul', timezone: 'Europe/Istanbul', region: 'Europe' },
    { city: 'Dubai', timezone: 'Asia/Dubai', region: 'Europe' },
    { city: 'Rome', timezone: 'Europe/Rome', region: 'Europe' },
    { city: 'Madrid', timezone: 'Europe/Madrid', region: 'Europe' },
    { city: 'Athens', timezone: 'Europe/Athens', region: 'Europe' },

    // Asia
    { city: 'Tokyo', timezone: 'Asia/Tokyo', region: 'Asia' },
    { city: 'Hong Kong', timezone: 'Asia/Hong_Kong', region: 'Asia' },
    { city: 'Bangkok', timezone: 'Asia/Bangkok', region: 'Asia' },
    { city: 'Singapore', timezone: 'Asia/Singapore', region: 'Asia' },
    { city: 'Shanghai', timezone: 'Asia/Shanghai', region: 'Asia' },
    { city: 'New Delhi', timezone: 'Asia/Kolkata', region: 'Asia' },
    { city: 'Manila', timezone: 'Asia/Manila', region: 'Asia' },
    { city: 'Seoul', timezone: 'Asia/Seoul', region: 'Asia' },
    { city: 'Jakarta', timezone: 'Asia/Jakarta', region: 'Asia' },
    { city: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur', region: 'Asia' },

    // Oceania
    { city: 'Sydney', timezone: 'Australia/Sydney', region: 'Oceania' },
    { city: 'Melbourne', timezone: 'Australia/Melbourne', region: 'Oceania' },
    { city: 'Auckland', timezone: 'Pacific/Auckland', region: 'Oceania' },
    { city: 'Fiji', timezone: 'Pacific/Fiji', region: 'Oceania' },
    { city: 'Samoa', timezone: 'Pacific/Apia', region: 'Oceania' },

    // Africa
    { city: 'Cairo', timezone: 'Africa/Cairo', region: 'Africa' },
    { city: 'Johannesburg', timezone: 'Africa/Johannesburg', region: 'Africa' },
    { city: 'Lagos', timezone: 'Africa/Lagos', region: 'Africa' },
    { city: 'Nairobi', timezone: 'Africa/Nairobi', region: 'Africa' },
];

// ==========================================
// Application State
// ==========================================

let appState = {
    clocks: [],
    is24Hour: false,
    updateInterval: null,
};

// ==========================================
// DOM Elements
// ==========================================

const elements = {
    modal: document.getElementById('modal'),
    closeModal: document.getElementById('closeModal'),
    addClockBtn: document.getElementById('addClockBtn'),
    emptyAddBtn: document.getElementById('emptyAddBtn'),
    toggleFormat: document.getElementById('toggleFormat'),
    zoneSearch: document.getElementById('zoneSearch'),
    searchResults: document.getElementById('searchResults'),
    clockGrid: document.getElementById('clockGrid'),
    emptyState: document.getElementById('emptyState'),
    clockTemplate: document.getElementById('clockTemplate'),
};

// ==========================================
// Initialization
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setupEventListeners();
    updateAllClocks();
    
    // Update every 1000ms (1 second)
    appState.updateInterval = setInterval(updateAllClocks, 1000);
});

// ==========================================
// Event Listeners
// ==========================================

function setupEventListeners() {
    // Modal controls
    elements.addClockBtn.addEventListener('click', openModal);
    elements.emptyAddBtn.addEventListener('click', openModal);
    elements.closeModal.addEventListener('click', closeModal);
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeModal();
    });

    // Search
    elements.zoneSearch.addEventListener('input', handleSearch);
    elements.zoneSearch.addEventListener('focus', handleSearch);

    // Format toggle
    elements.toggleFormat.addEventListener('click', toggleTimeFormat);

    // Close modal on timezone select (handled in timezone click)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('timezone-option')) {
            closeModal();
        }
    });
}

// ==========================================
// Modal Functions
// ==========================================

function openModal() {
    elements.modal.classList.remove('hidden');
    elements.zoneSearch.focus();
    elements.zoneSearch.value = '';
    showAllTimezones();
}

function closeModal() {
    elements.modal.classList.add('hidden');
    elements.zoneSearch.value = '';
    elements.searchResults.innerHTML = '';
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query === '') {
        showAllTimezones();
        return;
    }

    const filtered = TIMEZONES.filter(tz =>
        tz.city.toLowerCase().includes(query) ||
        tz.timezone.toLowerCase().includes(query) ||
        tz.region.toLowerCase().includes(query)
    );

    displaySearchResults(filtered);
}

function showAllTimezones() {
    displaySearchResults(TIMEZONES);
}

function displaySearchResults(results) {
    elements.searchResults.innerHTML = '';

    if (results.length === 0) {
        elements.searchResults.innerHTML = `
            <div style="padding: 1rem; text-align: center; color: var(--text-secondary);">
                No time zones found
            </div>
        `;
        return;
    }

    results.forEach(tz => {
        const isAdded = appState.clocks.some(c => c.timezone === tz.timezone);
        
        const option = document.createElement('div');
        option.className = 'timezone-option';
        option.innerHTML = `
            <div>
                <div class="timezone-name">${tz.city}</div>
                <div class="timezone-detail">${tz.timezone}</div>
            </div>
            <span style="opacity: ${isAdded ? 1 : 0.3};">${isAdded ? '✓' : '+'}</span>
        `;
        
        option.addEventListener('click', () => {
            if (!isAdded) {
                addClock(tz);
                closeModal();
            }
        });
        
        elements.searchResults.appendChild(option);
    });
}

// ==========================================
// Clock Management
// ==========================================

function addClock(tzData) {
    // Check if already exists
    if (appState.clocks.some(c => c.timezone === tzData.timezone)) {
        return;
    }

    const clock = {
        id: Date.now(),
        city: tzData.city,
        timezone: tzData.timezone,
        region: tzData.region,
    };

    appState.clocks.push(clock);
    renderClocks();
    saveToLocalStorage();
    updateAllClocks();
}

function removeClock(id) {
    appState.clocks = appState.clocks.filter(c => c.id !== id);
    renderClocks();
    saveToLocalStorage();
    updateAllClocks();
}

function renderClocks() {
    elements.clockGrid.innerHTML = '';

    if (appState.clocks.length === 0) {
        elements.emptyState.classList.remove('hidden');
        return;
    }

    elements.emptyState.classList.add('hidden');

    appState.clocks.forEach(clock => {
        const clone = elements.clockTemplate.content.cloneNode(true);
        const card = clone.querySelector('.clock-card');
        
        card.dataset.timezone = clock.timezone;
        card.dataset.id = clock.id;

        clone.querySelector('.city-name').textContent = clock.city;
        clone.querySelector('.timezone-offset').textContent = clock.timezone;

        // Remove button
        const removeBtn = clone.querySelector('.btn-remove');
        removeBtn.addEventListener('click', () => removeClock(clock.id));

        elements.clockGrid.appendChild(clone);
    });
}

// ==========================================
// Time Update Functions
// ==========================================

function updateAllClocks() {
    appState.clocks.forEach(clock => {
        updateClockDisplay(clock);
    });
}

function updateClockDisplay(clock) {
    const card = document.querySelector(`[data-id="${clock.id}"]`);
    if (!card) return;

    try {
        // Get time in specified timezone
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: clock.timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: !appState.is24Hour,
        });

        const parts = formatter.formatToParts(now);
        const timeParts = {};
        
        parts.forEach(part => {
            timeParts[part.type] = part.value;
        });

        // Format time display
        let timeDisplay;
        if (appState.is24Hour) {
            timeDisplay = `${timeParts.hour}:${timeParts.minute}:${timeParts.second}`;
        } else {
            timeDisplay = `${timeParts.hour}:${timeParts.minute}:${timeParts.second}`;
        }

        // Update time main
        const timeMainEl = card.querySelector('.time-main');
        timeMainEl.textContent = timeDisplay;

        // Update meridiem (AM/PM)
        const meridiemEl = card.querySelector('.time-meridiem');
        if (!appState.is24Hour) {
            const meridiem = timeParts.dayPeriod || (parseInt(timeParts.hour) >= 12 ? 'PM' : 'AM');
            meridiemEl.textContent = meridiem;
        } else {
            meridiemEl.textContent = '';
        }

        // Update date
        const dateStr = `${timeParts.month}/${timeParts.day}/${timeParts.year}`;
        card.querySelector('.date-display').textContent = dateStr;

        // Update day of week
        const dayFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: clock.timezone,
            weekday: 'long',
        });
        const dayOfWeek = dayFormatter.format(now);
        card.querySelector('.day-display').textContent = dayOfWeek;

        // Update UTC offset
        updateUTCOffset(card, clock.timezone);
    } catch (error) {
        console.error(`Error updating clock for ${clock.timezone}:`, error);
    }
}

function updateUTCOffset(card, timezone) {
    try {
        const now = new Date();
        const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        
        const offsetMs = tzDate - utcDate;
        const offsetHours = Math.floor(offsetMs / 3600000);
        const offsetMinutes = (Math.abs(offsetMs) % 3600000) / 60000;
        
        const sign = offsetHours >= 0 ? '+' : '';
        const offsetStr = offsetMinutes === 0 
            ? `UTC ${sign}${offsetHours}`
            : `UTC ${sign}${offsetHours}:${String(offsetMinutes).padStart(2, '0')}`;
        
        card.querySelector('.timezone-offset').textContent = offsetStr;
    } catch (error) {
        console.error('Error calculating UTC offset:', error);
    }
}

// ==========================================
// Format Toggle
// ==========================================

function toggleTimeFormat() {
    appState.is24Hour = !appState.is24Hour;
    
    // Update button text
    elements.toggleFormat.querySelector('.format-icon').textContent = 
        appState.is24Hour ? '12h' : '24h';
    
    updateAllClocks();
    saveToLocalStorage();
}

// ==========================================
// Local Storage
// ==========================================

function saveToLocalStorage() {
    const data = {
        clocks: appState.clocks,
        is24Hour: appState.is24Hour,
    };
    localStorage.setItem('worldClockState', JSON.stringify(data));
}

function loadFromLocalStorage() {
    try {
        const data = localStorage.getItem('worldClockState');
        if (data) {
            const parsed = JSON.parse(data);
            appState.clocks = parsed.clocks || [];
            appState.is24Hour = parsed.is24Hour || false;
            
            // Update button
            if (appState.is24Hour) {
                elements.toggleFormat.querySelector('.format-icon').textContent = '12h';
            }
            
            renderClocks();
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        appState.clocks = [];
        appState.is24Hour = false;
    }
}

// ==========================================
// Utility Functions
// ==========================================

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (appState.updateInterval) {
        clearInterval(appState.updateInterval);
    }
});

// Console welcome message
console.log('%c🌍 World Digital Clock', 'font-size: 20px; font-weight: bold; color: #00d4ff;');
console.log('%cReal-time time zone monitoring', 'font-size: 14px; color: #b0b0b0;');
