const input = document.getElementById("cityInput");
const button = document.querySelector(".searchBtn");
const myLocation = document.querySelector(".locBtn");

const weatherSec = document.querySelector(".weather-section");
const infoSec = document.querySelector(".info-section");
const dailyTemp = document.querySelector(".dailytemp-section");

/*-----------------------------------------------------------------------
-------------------------location lat and long--------------------------
----------------------------------------------------------------------- */
async function getLocationCoordi(city) {
  const response = await fetch(`/.netlify/functions/geocode?city=${city}`);

  const dataCoordi = await response.json();
  return dataCoordi.coord;
}

/*-----------------------------------------------------------------------
-------------------------gets weather--------------------------
----------------------------------------------------------------------- */
async function getLocation(lat, lon) {
  const response = await fetch(
    `/.netlify/functions/weather?lat=${lat}&lon=${lon}`,
  );

  const location = await response.json();
  return location;
}

/*-----------------------------------------------------------------------
-------------------------automatic get current location--------------------------
----------------------------------------------------------------------- */

let myPosition;

const successCallback = (position) => {
  myPosition = position;
};

navigator.geolocation.getCurrentPosition(successCallback);

/*-----------------------------------------------------------------------
-------------------------get multiple temps per hour--------------------------
----------------------------------------------------------------------- */

async function getTemps(lat, lon) {
  const response = await fetch(
    `/.netlify/functions/temps?lat=${lat}&lon=${lon}`,
  );

  const data = await response.json();
  return data;
}
/*-----------------------------------------------------------------------
-------------------------show weather--------------------------
----------------------------------------------------------------------- */

function weatherSecFunc(location, icon) {
  const image = `https://openweathermap.org/payload/api/media/file/${icon}.png`;

  return `
      <div class="weather-card">
      <div class="weather-first-col">
        <h2 class="temp">${Math.round(location.main.temp)}&deg;</h2>
        <img src="${image}" class="weather-icon">
        <p class="desc">${location.weather[0].description}</p>
        <br>
      </div>
      <div class="weather-second-col">
        <h3 class="location">${location.name}, ${location.sys.country}</h3>
      </div>
    </div>
  `;
}

function infoSecFunc(location, aiSuggestion) {
  //aiSuggestion
  return `<div class="info-card">
      <div class="info-first-col">
        <img src="icons/feels-like.png" class="icon">
          <p class="temp-feels">Feels Like: ${Math.round(location.main.feels_like)}</p>
        <img src="icons/windy.png" class="icon">
          <p>Wind Speed: ${location.wind.speed}km.</p>
        <img src="icons/humidity.png" class="icon">
          <p>Humidity: ${location.main.humidity}</p>
      </div>
      <div class="info-second-col" style="overflow-y:scroll;">
        <p class="wind">Clothing Suggestions:</p>
        <p>${aiSuggestion}</p>
      </div>
    </div>`;
}

function dailyTempFunc(dailyTemps) {
  const cards = dailyTemps.forecast.forecastday
    .slice(0, 3)
    .map(
      (day) => `
        <div class="card">
          <p>
            ${new Date(day.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
          </p>
          <img
            src="${day.day.condition.icon}"
            class="temp-icon"
            alt="${day.day.condition.text}"
          >
          <p><strong>${day.day.avgtemp_c}&deg;</strong></p>
        </div>
      `,
    )
    .join("");

  return `
    <div class="temp-cards">
      <div class="temp-first-col">
        ${cards}
      </div>
      <div class="temp-second-col"></div>
    </div>

  `;
}

function applyTheme(location) {
  const body = document.body;
  const weatherCard = weatherSec.querySelector(".weather-card");
  const infoCard1 = infoSec.querySelector(".info-first-col");
  const infoCard2 = infoSec.querySelector(".info-second-col");
  const tempCard = dailyTemp.querySelector(".temp-first-col");

  const isDay = location.weather[0].icon.includes("d");

  body.classList.toggle("day", isDay);
  body.classList.toggle("night", !isDay);

  weatherCard.classList.toggle("day", isDay);
  weatherCard.classList.toggle("night", !isDay);

  infoCard1.classList.toggle("night", !isDay);
  infoCard2.classList.toggle("night", !isDay);
  tempCard.classList.toggle("night", !isDay);
}

async function showWeather(location, dailyTemps, aiSuggestion) {
  const icon = location.weather[0].icon;

  weatherSec.innerHTML = weatherSecFunc(location, icon);
  infoSec.innerHTML = infoSecFunc(location, aiSuggestion);
  dailyTemp.innerHTML = dailyTempFunc(dailyTemps);

  applyTheme(location);
}

function showLoading() {
  weatherSec.innerHTML = `<p class="error">Loading Information</p>
 `;
  infoSec.innerHTML = ` <div class="loader-container">
    <div class="loader"></div>  
    </div>`;
  dailyTemp.innerHTML = ``;

  const appLogo = document.querySelector(".app-logo");
  if (appLogo) appLogo.remove();

  const appDesc = document.querySelector(".app-desc");
  if (appDesc) appDesc.remove();
}

async function main(location) {
  const response = await fetch("/.netlify/functions/gemini", {
    method: "POST",
    body: JSON.stringify({ location }),
  });

  const data = await response.json();
  return data.text;
}

/*-----------------------------------------------------------------------
-------------------------------------------------------
----------------------------------------------------------------------- */

button.addEventListener("click", async () => {
  let city = input.value.trim();

  if (!city) {
    weatherSec.innerHTML = `<p class="error">Please enter a city name</p>`;
    infoSec.innerHTML = ``;
    dailyTemp.innerHTML = ``;
    return;
  }

  if (!/^[a-zA-Z\s,'-]+$/.test(city)) {
    weatherSec.innerHTML = `<p class="error">Please enter a valid city name</p>`;
    infoSec.innerHTML = ``;
    dailyTemp.innerHTML = ``;
    return;
  }

  showLoading();
  button.disabled = true;

  try {
    const coords = await getLocationCoordi(city); //get coordinates
    console.log(coords);
    const location = await getLocation(coords.lat, coords.lon); //get weather info
    console.log(location);
    const dailyTemps = await getTemps(coords.lat, coords.lon);
    console.log(dailyTemps);
    const aiSuggestion = await main(location); //ai clothing suggestion

    await showWeather(location, dailyTemps, aiSuggestion);
  } catch (error) {
    weatherSec.innerHTML = `
        <p class="error">Cannot find city. Please enter another city name</p>
      `;
    infoSec.innerHTML = ``;
    dailyTemp.innerHTML = ``;

    console.log(error);
  } finally {
    button.disabled = false;
  }
});

myLocation.addEventListener("click", async () => {
  if (!location) {
    weatherSec.innerHTML = `
      <p class="error">Location not available. Please enable location services or use the search bar.</p>
    `;
    infoSec.innerHTML = ``;
    dailyTemp.innerHTML = ``;
  }

  showLoading();
  myLocation.disabled = true;

  try {
    const location = await getLocation(
      myPosition.coords.latitude,
      myPosition.coords.longitude,
    );
    const dailyTemps = await getTemps(
      myPosition.coords.latitude,
      myPosition.coords.longitude,
    );
    const aiSuggestion = await main(location);
    await showWeather(location, dailyTemps, aiSuggestion);
  } catch (error) {
    weatherSec.innerHTML = `
      <p class="error">Failed to load weather for your location. Please try again.</p>
    `;
    infoSec.innerHTML = ``;
    dailyTemp.innerHTML = ``;
    console.log(error);
  } finally {
    myLocation.disabled = false;
  }
});
