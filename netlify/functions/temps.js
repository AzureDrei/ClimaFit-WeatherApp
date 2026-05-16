exports.handler = async (event) => {
  const lat = event.queryStringParameters.lat;
  const lon = event.queryStringParameters.lon;

  const weatherAPI_KEY = process.env.WEATHERAPI_KEY;

  const response = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${weatherAPI_KEY}&q=${lat},${lon}&days=5&aqi=no&alerts=no`,
  );

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
