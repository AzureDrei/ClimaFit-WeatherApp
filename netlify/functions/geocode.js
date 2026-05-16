exports.handler = async (event) => {
  const city = event.queryStringParameters.city;

  const weatherAPI_KEY = process.env.OPENWEATHER_KEY;

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPI_KEY}&units=metric`,
  );

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
