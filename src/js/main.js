import 'regenerator-runtime/runtime';
import $ from 'jquery';

const searchByTextButton = document.querySelector('#search-by-text');
const searchByLocationButton = document.querySelector('#search-by-location');
const form = document.querySelector('form');
const API_KEY = '98cac722e9046a291089fa55992bb90f';

const getIconClass = (weatherId) => {
  let code = String(weatherId).charAt(0);

  if (code === '8' && weatherId !== 800) code = '9';
  switch (code) {
    case '2':
      return 'fa-bolt';
    case '3':
      return 'fa-cloud-rain';
    case '5':
      return 'fa-cloud-showers-heavy';
    case '6':
      return 'fa-snowflake';
    case '7':
      return 'fa-smog';
    case '8':
      return 'fa-sun';
    case '9':
      return 'fa-cloud';
    default:
      return 'fa-cloud';
  }
};

const deleteCard = (e) => {
  e.currentTarget.closest('.city-card').remove();
};

const renderCard = ({
  name,
  latitude,
  longitude,
  temp,
  feltTemp,
  humidity,
  weatherId,
  weatherDesc,
}) => {
  document.querySelectorAll('.name').forEach((element) => {
    if (name === element.innerText) element.closest('.city-card').remove();
  });

  const iconClass = getIconClass(weatherId);
  const newCard = $('#content').append(`
    <div class="city-card">
        <div class="name">${name}</div>
        <div class="coords">N:${latitude.toFixed(2)} E:${longitude.toFixed(2)}</div>
        <div class="temperature">${Math.round(temp)}&deg;C(${Math.round(feltTemp)}&deg;C)</div>
        <i class="weather-icon fas ${iconClass} fa-10x"></i>
        <div class="weather-desc">${weatherDesc}</div>
        <div class="weather-humidity">Wilgotność: ${humidity}%</div>
        <i class="delete-card-icon fas fa-times fa-2x"></i>
    </div>
    `);
  const deleteIcon = newCard.find('.delete-card-icon');
  deleteIcon.on('click', deleteCard);
};

const getWeatherDetails = async (e, name) => {
  try {
    let response;

    e.preventDefault();
    if (e.currentTarget === window) {
      response = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?q=${name}&APPID=${API_KEY}&units=metric&&lang=pl`,
        { mode: 'cors' }
      );
    } else if (e.currentTarget.id === 'search-by-text') {
      const city = document.querySelector('#search-input').value;

      response = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}&units=metric&&lang=pl`,
        { mode: 'cors' }
      );
    } else if (e.currentTarget.id === 'search-by-location') {
      const locationInfo = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude: lat, longitude: lon } = locationInfo.coords;

      response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&&APPID=${API_KEY}&units=metric&&lang=pl`,
        { mode: 'cors' }
      );
    }

    if (response.ok) {
      const processedResponse = await response.json();
      const relevantData = {};

      relevantData.name = processedResponse.name;
      relevantData.longitude = processedResponse.coord.lon;
      relevantData.latitude = processedResponse.coord.lat;
      relevantData.temp = processedResponse.main.temp;
      relevantData.feltTemp = processedResponse.main.feels_like;
      relevantData.humidity = processedResponse.main.humidity;
      relevantData.weatherId = processedResponse.weather[0].id;
      relevantData.weatherDesc = processedResponse.weather[0].description;
      renderCard(relevantData);
    } else {
      throw new Error("Couldn't find the requested city.");
    }
  } catch (err) {
    window.alert(err.message);
  }
};

window.onbeforeunload = () => {
  const cityNameElements = document.querySelectorAll('.name');
  const cityNames = [];

  cityNameElements.forEach((element) => {
    cityNames.push(element.innerText);
  });
  localStorage.setItem('names', JSON.stringify(cityNames));
};

window.onload = (e) => {
  const names = JSON.parse(localStorage.getItem('names'));
  if (names !== null) {
    names.forEach((name) => {
      getWeatherDetails(e, name);
    });
  }
};

searchByTextButton.addEventListener('click', getWeatherDetails);
searchByLocationButton.addEventListener('click', getWeatherDetails);
form.addEventListener('submit', getWeatherDetails);
