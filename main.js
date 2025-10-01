import './style.css';

const UNSPLASH_ACCESS_KEY = '03s6h7b7mI2tjZbtMEjL-gqkoTEYtn1rD24sSyzEMy4';
const WEATHER_API_KEY = '612308136b72fd80013cdbd22e1e327a';

let currentDestination = '';

function initApp() {
  document.querySelector('#app').innerHTML = `
    <header>
      <div class="container">
        <div class="header-content">
          <div>
            <h1>Travel Explorer</h1>
            <p class="subtitle">Discover destinations, explore photos, and check the weather</p>
          </div>
          <div class="search-container">
            <div class="search-box">
              <input
                type="text"
                id="searchInput"
                placeholder="Enter a destination (e.g., Paris, Tokyo, New York)"
                autocomplete="off"
              />
              <button id="searchBtn">Explore</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main>
      <div class="container">
        <div id="content">
          <div class="empty-state">
            <div class="empty-state-icon">🌍</div>
            <h2>Start Your Journey</h2>
            <p>Search for any destination to explore photos and weather information</p>
          </div>
        </div>
      </div>
    </main>

    <footer>
      <div class="container">
        <p>Powered by Unsplash & OpenWeatherMap APIs</p>
      </div>
    </footer>
  `;

  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
}

async function handleSearch() {
  const searchInput = document.getElementById('searchInput');
  const destination = searchInput.value.trim();

  if (!destination) {
    showError('Please enter a destination');
    return;
  }

  currentDestination = destination;
  showLoading();

  try {
    const [weatherData, photosData] = await Promise.all([
      fetchWeather(destination),
      fetchPhotos(destination)
    ]);

    displayContent(weatherData, photosData);
  } catch (error) {
    showError(error.message);
  }
}

async function fetchWeather(destination) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(destination)}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Destination not found. Please try another location.');
      }
      throw new Error('Failed to fetch weather data');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Unable to fetch weather information');
  }
}

async function fetchPhotos(destination) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&per_page=12&client_id=${UNSPLASH_ACCESS_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch photos');
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    throw new Error('Unable to fetch photos');
  }
}

function showLoading() {
  const content = document.getElementById('content');
  content.innerHTML = '<div class="loading">Exploring destination...</div>';
}

function showError(message) {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="error">${message}</div>`;
}

function displayContent(weatherData, photos) {
  const content = document.getElementById('content');

  const weatherIcon = getWeatherIcon(weatherData.weather[0].main);

  content.innerHTML = `
    <div class="content-grid">
      <div class="weather-card">
        <div class="weather-header">
          <div class="weather-location">
            <h2>${weatherData.name}, ${weatherData.sys.country}</h2>
            <p>${weatherData.weather[0].description}</p>
          </div>
          <div class="weather-temp">
            <div class="temp-value">${Math.round(weatherData.main.temp)}<span class="temp-unit">°C</span></div>
            <div class="weather-icon">${weatherIcon}</div>
          </div>
        </div>
        <div class="weather-details">
          <div class="weather-detail">
            <div class="detail-label">Feels Like</div>
            <div class="detail-value">${Math.round(weatherData.main.feels_like)}°C</div>
          </div>
          <div class="weather-detail">
            <div class="detail-label">Humidity</div>
            <div class="detail-value">${weatherData.main.humidity}%</div>
          </div>
          <div class="weather-detail">
            <div class="detail-label">Wind Speed</div>
            <div class="detail-value">${Math.round(weatherData.wind.speed * 3.6)} km/h</div>
          </div>
          <div class="weather-detail">
            <div class="detail-label">Pressure</div>
            <div class="detail-value">${weatherData.main.pressure} hPa</div>
          </div>
        </div>
      </div>

      <div class="photos-section">
        <h2 class="section-title">Explore ${currentDestination}</h2>
        <div class="photos-grid">
          ${photos.map(photo => `
            <div class="photo-card" onclick="window.open('${photo.links.html}', '_blank')">
              <img
                src="${photo.urls.regular}"
                alt="${photo.alt_description || currentDestination}"
                loading="lazy"
              />
              <div class="photo-info">
                <p class="photo-description">${photo.alt_description || 'Beautiful view of ' + currentDestination}</p>
                <p class="photo-author">Photo by <a href="${photo.user.links.html}?utm_source=travel_explorer&utm_medium=referral" target="_blank">${photo.user.name}</a></p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function getWeatherIcon(condition) {
  const icons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Smoke': '🌫️',
    'Haze': '🌫️',
    'Dust': '🌫️',
    'Fog': '🌫️',
    'Sand': '🌫️',
    'Ash': '🌫️',
    'Squall': '💨',
    'Tornado': '🌪️'
  };

  return icons[condition] || '🌤️';
}

initApp();
