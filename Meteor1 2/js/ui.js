// UI rendering and management
import { appState } from './state.js';
import { getWeatherIcon, getWeatherDescription, getAQIColor, getAQIDescription, formatDistance } from './utils.js';

// DOM elements cache
let domElements = {};

// Initialize DOM element cache
export function initializeDOMElements() {
    domElements = {
        // Loading and app
        loadingScreen: document.getElementById('loading-screen'),
        app: document.getElementById('app'),
        
        // Search elements
        searchInput: document.getElementById('search-input'),
        searchSuggestions: document.getElementById('search-suggestions'),
        locationBtn: document.getElementById('location-btn'),
        
        // Current weather
        currentWeather: document.getElementById('current-weather'),
        
        // Weather cards
        hourlyChart: document.getElementById('hourly-chart'),
        aqiContent: document.getElementById('aqi-content'),
        astronomyContent: document.getElementById('astronomy-content'),
        detailsContent: document.getElementById('details-content'),
        
        // Weekly forecast
        forecastCards: document.getElementById('forecast-cards'),
        
        // Theme toggle
        themeToggle: document.getElementById('theme-toggle'),
        
        // Settings
        settingsBtn: document.getElementById('settings-btn'),
        settingsModal: document.getElementById('settings-modal'),
        closeSettings: document.getElementById('close-settings'),
        tempUnit: document.getElementById('temp-unit'),
        windUnit: document.getElementById('wind-unit'),
        timeFormat: document.getElementById('time-format'),
        autoRefresh: document.getElementById('auto-refresh'),
        
        // Toast notifications
        errorToast: document.getElementById('error-toast'),
        errorMessage: document.getElementById('error-message'),
        successToast: document.getElementById('success-toast'),
        successMessage: document.getElementById('success-message'),
        
        // Favorites
        favoritesPanel: document.getElementById('favorites-panel'),
        favoritesList: document.getElementById('favorites-list'),
        closeFavorites: document.getElementById('close-favorites')


        // History modal
historyBtn: document.getElementById('history-btn'),
historyModal: document.getElementById('history-modal'),
closeHistory: document.getElementById('close-history'),
historyPrev: document.getElementById('history-prev'),
historyNext: document.getElementById('history-next'),
historyMonth: document.getElementById('history-month'),
historyGrid: document.getElementById('history-grid'),
historyDetails: document.getElementById('history-details'),

    };
}

// Show loading screen
export function showLoading() {
    if (domElements.loadingScreen) {
        domElements.loadingScreen.classList.remove('hidden');
    }
}

// Hide loading screen
export function hideLoading() {
    if (domElements.loadingScreen) {
        setTimeout(() => {
            domElements.loadingScreen.classList.add('hidden');
        }, 500);
    }
}

// Show error toast
export function showError(message) {
    if (domElements.errorMessage && domElements.errorToast) {
        domElements.errorMessage.textContent = message;
        domElements.errorToast.classList.add('show');
        
        setTimeout(() => {
            domElements.errorToast.classList.remove('show');
        }, 5000);
    }
}

// Show success toast
export function showSuccess(message) {
    if (domElements.successMessage && domElements.successToast) {
        domElements.successMessage.textContent = message;
        domElements.successToast.classList.add('show');
        
        setTimeout(() => {
            domElements.successToast.classList.remove('show');
        }, 3000);
    }
}

// Render search suggestions
export function renderSearchSuggestions(suggestions) {
    if (!domElements.searchSuggestions) return;
    
    if (!suggestions || suggestions.length === 0) {
        domElements.searchSuggestions.classList.remove('show');
        domElements.searchSuggestions.innerHTML = '';
        return;
    }
    
    const html = suggestions.map(city => `
        <div class="suggestion-item" data-lat="${city.latitude}" data-lng="${city.longitude}" data-name="${city.name}" data-country="${city.country}" data-admin1="${city.admin1 || ''}">
            <div class="suggestion-name">${city.name}</div>
            <div class="suggestion-details">${[city.admin1, city.country].filter(Boolean).join(', ')}</div>
        </div>
    `).join('');
    
    domElements.searchSuggestions.innerHTML = html;
    domElements.searchSuggestions.classList.add('show');
}

// Hide search suggestions
export function hideSearchSuggestions() {
    if (domElements.searchSuggestions) {
        domElements.searchSuggestions.classList.remove('show');
    }
}

// Render current weather hero section
export function renderCurrentWeather(location, weather) {
    if (!domElements.currentWeather || !weather?.current) return;
    
    const current = weather.current;
    const weatherIcon = getWeatherIcon(current.weather_code);
    const weatherDesc = getWeatherDescription(current.weather_code);
    
    const html = `
        <div class="current-location fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" fill="none"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            <span>${location.name}${location.admin1 ? `, ${location.admin1}` : ''}</span>
        </div>
        
        <div class="current-temp">${appState.formatTemperature(current.temperature_2m)}</div>
        <div class="current-condition">${weatherDesc}</div>
        <div class="current-feels-like">Feels like ${appState.formatTemperature(current.apparent_temperature)}</div>
        
        <div class="current-details">
            <div class="detail-item">
                <svg class="detail-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5Z" fill="currentColor"/>
                    <path d="M12 5L8 21l4-7 4 7-4-16Z" fill="white"/>
                </svg>
                <div class="detail-label">Wind</div>
                <div class="detail-value">${appState.formatWindSpeed(current.wind_speed_10m)}</div>
            </div>
            
            <div class="detail-item">
                <svg class="detail-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12h1m16-8v1m-8-5v1m8 8h1M5.6 5.6l.7.7m12.1-.7-.7.7M9 16c0 1.11.89 2 2 2s2-.89 2-2-.89-2-2-2-2 .89-2 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                <div class="detail-label">Humidity</div>
                <div class="detail-value">${current.relative_humidity_2m}%</div>
            </div>
            
            <div class="detail-item">
                <svg class="detail-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 4.5V9a3 3 0 0 1-3 3H4" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M14 4.5a4.5 4.5 0 0 1 0 9 4.5 4.5 0 0 1 0-9Z" fill="currentColor"/>
                </svg>
                <div class="detail-label">Pressure</div>
                <div class="detail-value">${Math.round(current.pressure_msl)} hPa</div>
            </div>
            
            <div class="detail-item">
                <svg class="detail-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" fill="currentColor"/>
                    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
                    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
                    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
                </svg>
                <div class="detail-label">UV Index</div>
                <div class="detail-value">${Math.round(current.uv_index || 0)}</div>
            </div>
        </div>
    `;
    
    domElements.currentWeather.innerHTML = html;
}

// Render air quality information
export function renderAirQuality(airQuality) {
    if (!domElements.aqiContent || !airQuality?.current) return;
    
    const current = airQuality.current;
    const aqi = current.us_aqi || 0;
    const aqiColor = getAQIColor(aqi);
    const aqiDescription = getAQIDescription(aqi);
    
    const html = `
        <div class="aqi-meter">
            <div class="aqi-value" style="color: ${aqiColor}">${aqi}</div>
            <div class="aqi-label ${aqiDescription.toLowerCase().replace(' ', '-')}" style="background: ${aqiColor}">
                ${aqiDescription}
            </div>
        </div>
        
        <div class="aqi-details">
            <div class="aqi-detail">
                <div class="aqi-detail-label">PM2.5</div>
                <div class="aqi-detail-value">${Math.round(current.pm2_5 || 0)} μg/m³</div>
            </div>
            <div class="aqi-detail">
                <div class="aqi-detail-label">PM10</div>
                <div class="aqi-detail-value">${Math.round(current.pm10 || 0)} μg/m³</div>
            </div>
            <div class="aqi-detail">
                <div class="aqi-detail-label">CO</div>
                <div class="aqi-detail-value">${Math.round(current.carbon_monoxide || 0)} μg/m³</div>
            </div>
            <div class="aqi-detail">
                <div class="aqi-detail-label">O₃</div>
                <div class="aqi-detail-value">${Math.round(current.ozone || 0)} μg/m³</div>
            </div>
        </div>
    `;
    
    domElements.aqiContent.innerHTML = html;
}

// Render astronomy information
export function renderAstronomy(weather) {
    if (!domElements.astronomyContent || !weather?.daily) return;
    
    const today = weather.daily;
    const sunrise = today.sunrise[0];
    const sunset = today.sunset[0];
    const uvIndex = today.uv_index_max[0];
    
    // Calculate day length
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);
    const dayLength = Math.floor((sunsetTime - sunriseTime) / (1000 * 60 * 60 * 60));
    
    const html = `
        <div class="astronomy-grid">
            <div class="astronomy-item">
                <svg class="astronomy-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" fill="currentColor"/>
                    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
                    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
                    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
                </svg>
                <div class="astronomy-label">Sunrise</div>
                <div class="astronomy-value">${appState.formatTime(sunrise)}</div>
            </div>
            
            <div class="astronomy-item">
                <svg class="astronomy-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" fill="currentColor"/>
                    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                </svg>
                <div class="astronomy-label">Sunset</div>
                <div class="astronomy-value">${appState.formatTime(sunset)}</div>
            </div>
            
            <div class="astronomy-item">
                <svg class="astronomy-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                <div class="astronomy-label">Day Length</div>
                <div class="astronomy-value">${dayLength}h</div>
            </div>
            
            <div class="astronomy-item">
                <svg class="astronomy-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" fill="currentColor"/>
                    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
                    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
                    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
                </svg>
                <div class="astronomy-label">UV Index</div>
                <div class="astronomy-value">${Math.round(uvIndex || 0)}</div>
            </div>
        </div>
    `;
    
    domElements.astronomyContent.innerHTML = html;
}

// Render weather details
export function renderWeatherDetails(weather) {
    if (!domElements.detailsContent || !weather?.current) return;
    
    const current = weather.current;
    const windDirection = current.wind_direction_10m;
    
    // Convert wind direction to compass
    const getWindDirection = (degrees) => {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return directions[Math.round(degrees / 22.5) % 16];
    };
    
    const html = `
        <div class="details-grid">
            <div class="detail-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5Z" fill="currentColor"/>
                    <path d="M12 5L8 21l4-7 4 7-4-16Z" fill="white"/>
                </svg>
                <div class="detail-label">Wind Direction</div>
                <div class="detail-value">${getWindDirection(windDirection)}</div>
            </div>
            
            <div class="detail-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 3v2l-1.5 1L3 8l2.5 1L3 11l1.5 1L6 14v2h2l2-1.5 2 1.5h2v-2l1.5-1L17 11l-1.5-2L17 7l-1.5-1L14 4v-2h-2l-2 1.5L8 2H6v1Z" fill="currentColor"/>
                </svg>
                <div class="detail-label">Precipitation</div>
                <div class="detail-value">${Math.round(current.precipitation || 0)} mm</div>
            </div>
            
            <div class="detail-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12h1m16-8v1m-8-5v1m8 8h1M5.6 5.6l.7.7m12.1-.7-.7.7M9 16c0 1.11.89 2 2 2s2-.89 2-2-.89-2-2-2-2 .89-2 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                <div class="detail-label">Feels Like</div>
                <div class="detail-value">${appState.formatTemperature(current.apparent_temperature)}</div>
            </div>
            
            <div class="detail-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                <div class="detail-label">Visibility</div>
                <div class="detail-value">${formatDistance((weather.hourly?.visibility?.[0] || 10000) / 1000)} km</div>
            </div>
        </div>
    `;
    
    domElements.detailsContent.innerHTML = html;
}

// Render weekly forecast
export function renderWeeklyForecast(weather) {
    if (!domElements.forecastCards || !weather?.daily) return;
    
    const daily = weather.daily;
    const cards = [];
    
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : dayjs(date).format('dddd');
        const weatherIcon = getWeatherIcon(daily.weather_code[i]);
        const weatherDesc = getWeatherDescription(daily.weather_code[i]);
        
        cards.push(`
            <div class="forecast-card slide-up" style="animation-delay: ${i * 100}ms">
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-icon">${weatherIcon}</div>
                <div class="forecast-temps">
                    <span class="forecast-high">${appState.formatTemperature(daily.temperature_2m_max[i])}</span>
                    <span class="forecast-low">${appState.formatTemperature(daily.temperature_2m_min[i])}</span>
                </div>
                <div class="forecast-condition">${weatherDesc}</div>
                <div class="forecast-details">
                    <span>💧 ${Math.round(daily.precipitation_probability_max[i] || 0)}%</span>
                    <span>💨 ${appState.formatWindSpeed(daily.wind_speed_10m_max[i])}</span>
                </div>
            </div>
        `);
    }
    
    domElements.forecastCards.innerHTML = cards.join('');
}

// Update settings UI
export function updateSettingsUI() {
    const state = appState.get();
    const settings = state.settings;
    
    if (domElements.tempUnit) domElements.tempUnit.value = settings.temperatureUnit;
    if (domElements.windUnit) domElements.windUnit.value = settings.windSpeedUnit;
    if (domElements.timeFormat) domElements.timeFormat.value = settings.timeFormat;
    if (domElements.autoRefresh) domElements.autoRefresh.checked = settings.autoRefresh;
    
    // Apply theme
    appState.applyTheme(settings.theme);
}

// Render favorites list
export function renderFavorites() {
    if (!domElements.favoritesList) return;
    
    const state = appState.get();
    const favorites = state.favorites;
    
    if (favorites.length === 0) {
        domElements.favoritesList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p>No favorite locations yet.</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Search for a location to add it to favorites.</p>
            </div>
        `;
        return;
    }
    
    const html = favorites.map(favorite => `
        <div class="favorite-item" data-lat="${favorite.latitude}" data-lng="${favorite.longitude}" data-name="${favorite.name}" data-country="${favorite.country}" data-admin1="${favorite.admin1 || ''}">
            <div class="favorite-info">
                <div class="favorite-name">${favorite.name}</div>
                <div class="favorite-temp">
                    ${favorite.lastWeather ? appState.formatTemperature(favorite.lastWeather.temperature) : '--'}
                </div>
            </div>
            <button class="icon-btn remove-favorite" data-id="${favorite.id}" aria-label="Remove from favorites">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                </svg>
            </button>
        </div>
    `).join('');
    
    domElements.favoritesList.innerHTML = html;
}

// Show/hide favorites panel
export function toggleFavorites(show = null) {
    if (!domElements.favoritesPanel) return;
    
    const isOpen = domElements.favoritesPanel.classList.contains('open');
    
    if (show === null) {
        show = !isOpen;
    }
    
    if (show) {
        domElements.favoritesPanel.classList.add('open');
        renderFavorites();
    } else {
        domElements.favoritesPanel.classList.remove('open');
    }
}

// Show/hide settings modal
export function toggleSettings(show = null) {
    if (!domElements.settingsModal) return;
    
    const isOpen = domElements.settingsModal.classList.contains('open');
    
    if (show === null) {
        show = !isOpen;
    }
    
    if (show) {
        domElements.settingsModal.classList.add('open');
        updateSettingsUI();
    } else {
        domElements.settingsModal.classList.remove('open');
    }
}




let historyMonthOffset = 0; // 0 = current month, 1 = previous month, etc.

export function toggleHistory(show = null) {
  const modal = domElements.historyModal;
  if (!modal) return;
  const isOpen = modal.classList.contains('open');
  if (show === null) show = !isOpen;
  if (show) modal.classList.add('open'); else modal.classList.remove('open');
}

export function renderHistoryCalendar(weather, offset = historyMonthOffset) {
  if (!weather?.daily || !domElements.historyGrid) return;

  historyMonthOffset = offset;

  const d = weather.daily;
  const dateList = d.time.map(t => dayjs(t));
  const byISO = new Map(d.time.map((t, i) => [dayjs(t).format('YYYY-MM-DD'), i]));

  const today = dayjs().startOf('day');
  const monthStart = today.subtract(offset, 'month').startOf('month');
  const monthEnd = monthStart.endOf('month');
  const startPad = monthStart.day(); // 0=Sun

  domElements.historyMonth.textContent = monthStart.format('MMMM YYYY');

  // Build cells
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push('<div></div>');

  for (let dte = monthStart; dte.isBefore(monthEnd) || dte.isSame(monthEnd, 'day'); dte = dte.add(1, 'day')) {
    const iso = dte.format('YYYY-MM-DD');
    const idx = byISO.get(iso);
    const isFuture = dte.isAfter(today);
    const isToday = dte.isSame(today, 'day');

    if (idx !== undefined && !isFuture) {
      const icon = getWeatherIcon(d.weather_code[idx]);
      const hi = appState.formatTemperature(d.temperature_2m_max[idx]);
      const lo = appState.formatTemperature(d.temperature_2m_min[idx]);

      cells.push(`
        <button class="calendar-day ${isToday ? 'today' : ''}" data-iso="${iso}">
          <div class="date">${dte.date()}</div>
          <div class="icon">${icon}</div>
          <div class="temps"><span class="hi">${hi}</span><span class="lo">${lo}</span></div>
        </button>
      `);
    } else {
      cells.push(`
        <div class="calendar-day disabled ${isToday ? 'today' : ''}">
          <div class="date">${dte.date()}</div>
        </div>
      `);
    }
  }

  domElements.historyGrid.innerHTML = cells.join('');

  // Click handlers for days
  domElements.historyGrid.querySelectorAll('.calendar-day[data-iso]').forEach(el => {
    el.addEventListener('click', () => {
      domElements.historyGrid.querySelectorAll('.calendar-day').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');

      const iso = el.getAttribute('data-iso');
      const i = byISO.get(iso);
      const when = dayjs(iso).format('dddd, MMM D, YYYY');
      const desc = getWeatherDescription(d.weather_code[i]);

      domElements.historyDetails.innerHTML = `
        <h4>${when}</h4>
        <div>${getWeatherIcon(d.weather_code[i])} ${desc}</div>
        <div class="row">
          <div>High: <strong>${appState.formatTemperature(d.temperature_2m_max[i])}</strong></div>
          <div>Low: <strong>${appState.formatTemperature(d.temperature_2m_min[i])}</strong></div>
          <div>Precip: <strong>${Math.round(d.precipitation_sum?.[i] || 0)} mm</strong></div>
          <div>UV Max: <strong>${Math.round(d.uv_index_max?.[i] || 0)}</strong></div>
          <div>Wind Max: <strong>${appState.formatWindSpeed(d.wind_speed_10m_max?.[i] || 0)}</strong></div>
          <div>Sunrise: <strong>${appState.formatTime(d.sunrise?.[i])}</strong></div>
          <div>Sunset: <strong>${appState.formatTime(d.sunset?.[i])}</strong></div>
        </div>
      `;
    });
  });

  // Prev/Next month nav
  const earliest = dayjs(d.time[0]).startOf('month');
  const canGoPrev = monthStart.isAfter(earliest, 'month');
  const canGoNext = offset > 0; // next moves toward current month (offset--)

  domElements.historyPrev.disabled = !canGoPrev;
  domElements.historyNext.disabled = !canGoNext;

  domElements.historyPrev.onclick = () => renderHistoryCalendar(weather, offset + 1);
  domElements.historyNext.onclick = () => renderHistoryCalendar(weather, Math.max(0, offset - 1));

  // Auto-select the most recent day in the visible month that has data
  const latestIso = d.time
    .map(t => dayjs(t))
    .filter(dt => dt.isSame(monthStart, 'month') && !dt.isAfter(today))
    .sort((a, b) => b.valueOf() - a.valueOf())[0]?.format('YYYY-MM-DD');

  if (latestIso) {
    const el = domElements.historyGrid.querySelector(`[data-iso="${latestIso}"]`);
    if (el) el.click();
  } else {
    domElements.historyDetails.innerHTML = `<em>No past data for this month.</em>`;
  }
}
   



// Get DOM elements reference for external use
export function getDOMElements() {
    return domElements;
}