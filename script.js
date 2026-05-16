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

async function showWeather(location, dailyTemps, aiSuggestion) {
  //get icon
  const icon = location.weather[0].icon;
  const image = `https://openweathermap.org/payload/api/media/file/${icon}.png`;

  //HTML

  weatherSec.innerHTML = `
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

  infoSec.innerHTML = `
    <div class="info-card">
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
    </div>
  `;

  dailyTemp.innerHTML = `
  <div class="temp-cards">
    <div class=temp-first-col>
      <div class="card-0">
        <p>${new Date(
          dailyTemps.forecast.forecastday[0].date,
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })}
        </p>
        <img src=${dailyTemps.forecast.forecastday[0].day.condition.icon} class=temp-icon>
        <p><strong>${dailyTemps.forecast.forecastday[0].day.avgtemp_c}&deg;</strong></p>
      </div>
      <div class="card-1">
        <p>${new Date(
          dailyTemps.forecast.forecastday[1].date,
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })}
        </p>
        <img src=${dailyTemps.forecast.forecastday[1].day.condition.icon} class=temp-icon>
        <p><strong>${dailyTemps.forecast.forecastday[1].day.avgtemp_c}&deg;</strong></p>
      </div>
      <div class="card-2">
        <p>${new Date(
          dailyTemps.forecast.forecastday[2].date,
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })}
        </p>
        <img src=${dailyTemps.forecast.forecastday[2].day.condition.icon} class=temp-icon>
        <p><strong>${dailyTemps.forecast.forecastday[2].day.avgtemp_c}&deg;</strong></p>
      </div>
      <div class="card-3">
        <p>${new Date(
          dailyTemps.forecast.forecastday[3].date,
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })}
        </p> 
       <img src=${dailyTemps.forecast.forecastday[3].day.condition.icon} class=temp-icon>
       <p><strong>${dailyTemps.forecast.forecastday[3].day.avgtemp_c}&deg;</strong></p>
      </div>
    </div>
    <div class=temp-second-col></div>
  </div>

  `;

  const body = document.body;
  const weatherCard = weatherSec.querySelector(".weather-card");
  const infoCard1 = infoSec.querySelector(".info-first-col");
  const infoCard2 = infoSec.querySelector(".info-second-col");
  const tempCard = dailyTemp.querySelector(".temp-first-col");

  if (location.weather[0].icon.includes("d")) {
    body.classList.add("day");
    body.classList.remove("night");
    weatherCard.classList.add("day");
    weatherCard.classList.remove("night");
  } else {
    body.classList.add("night");
    body.classList.remove("day");
    weatherCard.classList.add("night");
    weatherCard.classList.remove("day");
    infoCard1.classList.add("night");
    infoCard2.classList.add("night");
    tempCard.classList.add("night");
  }

  const appLogo = document.querySelector(".app-logo");
  if (appLogo) appLogo.remove();

  const appDesc = document.querySelector(".app-desc");
  if (appDesc) appDesc.remove();
}

/*-----------------------------------------------------------------------
-------------------------GEMINI API--------------------------
----------------------------------------------------------------------- */
// import { GoogleGenAI, ThinkingLevel } from "https://esm.run/@google/genai";

// async function main(location) {
//   const response = await ai.models.generateContent({
//     model: "gemini-3-flash-preview",
//     contents: prompt(location),
//     config: {
//       thinkingConfig: {
//         thinkingLevel: ThinkingLevel.LOW,
//       },
//     },
//   });
//   return response.text;
// }

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

  if (/^[a-zA-Z\s,]+$/.test(city)) {
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
    }
  } else {
    weatherSec.innerHTML = `
      <p class="error">Please enter a valid city name</p>
    `;
    infoSec.innerHTML = ``;
    dailyTemp.innerHTML = ``;
    console.log(error);
  }
});

myLocation.addEventListener("click", async () => {
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
      <p class="error">Browser does not support automatic location, please use search bar</p>
    `;
    infoSec.innerHTML = ``;
    dailyTemp.innerHTML = ``;
    console.log(error);
  }
});
