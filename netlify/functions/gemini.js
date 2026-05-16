const { GoogleGenAI, ThinkingLevel } = require("@google/genai");

function prompt(location) {
  return `
Can you make clothing recommendations based on the weather:

Location: ${location.name}, ${location.sys.country}
Temperature: ${location.main.temp}°C
Weather: ${location.weather[0].description}
Wind speed: ${location.wind.speed}
Humidity: ${location.main.humidity}

Format:
- brief summary first
- then clothing suggestions

Use:
• for bullet points
**Men**
**Women**
`;
}

exports.handler = async (event) => {
  try {
    const { location } = JSON.parse(event.body);
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt(location),
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ text: response.text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
