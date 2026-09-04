/**
 * WEATHER TOOL
 *
 * Gets real weather from Open-Meteo API
 *
 * Why Open-Meteo?
 * - Free
 * - No API key needed
 * - Real data
 * - No rate limits
 *
 * Process:
 * 1. User asks for city weather
 * 2. Get city coordinates (latitude, longitude)
 * 3. Get weather for those coordinates
 * 4. Return formatted result
 */

import { ValidationService } from '../../services/validation.service';
import { Tool } from '../../core/tool';
import axios from 'axios';
import z from 'zod';

export const createWeatherTool = (): Tool => {
  return new Tool('getWeather', {
    description:
      'Get current weather for any city in the world. Returns temperature, condition, humidity, and wind speed.',

    inputSchema: z.object({
      city: z.string().describe('City name (e.g., "Paris", "Tokyo", "New York")'),
    }),

    execute: async ({ city }) => {
      try {
        //STep -0
        const validation = ValidationService.validateCity(city);
        if (!validation.valid) {
          return JSON.stringify({
            success: false,
            city,
            error: validation.error,
          });
        }
        console.log(`\n🌤️  Fetching weather for ${city}...`);

        // STEP 1: Get city coordinates
        console.log(`  → Step 1: Finding coordinates for "${city}"`);

        const geoResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
          params: {
            name: city,
            count: 1,
            language: 'en',
            format: 'json',
          },
        });

        const location = geoResponse.data.results?.[0];
        if (!location) {
          console.log(`  ❌ City not found: ${city}`);
          return JSON.stringify({
            success: false,
            city,
            error: 'City not found',
          });
        }

        const { latitude, longitude, name, country } = location;
        console.log(`  ✅ Found: ${name}, ${country} (${latitude}, ${longitude})`);

        // STEP 2: Get weather data
        console.log(`  → Step 2: Fetching weather data`);

        const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude,
            longitude,
            current:
              'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature',
            timezone: 'auto',
          },
        });

        const current = weatherResponse.data.current;

        // STEP 3: Map weather codes to descriptions
        const weatherDescriptions: Record<number, string> = {
          0: 'Clear sky ☀️',
          1: 'Mainly clear 🌤️',
          2: 'Partly cloudy ⛅',
          3: 'Overcast ☁️',
          45: 'Foggy 🌫️',
          51: 'Light drizzle 🌦️',
          61: 'Slight rain 🌧️',
          63: 'Moderate rain 🌧️',
          65: 'Heavy rain ⛈️',
          71: 'Slight snow ❄️',
          73: 'Moderate snow ❄️',
          75: 'Heavy snow ❄️',
          80: 'Moderate showers 🌧️',
          81: 'Heavy showers ⛈️',
          95: 'Thunderstorm ⛈️',
        };

        const weatherCondition = weatherDescriptions[current.weather_code];

        console.log(`  ✅ Weather data retrieved`);

        // STEP 4: Format and return result
        const result = {
          success: true,
          city: name,
          country,
          latitude,
          longitude,
          temperature: current.temperature_2m,
          apparentTemperature: current.apparent_temperature,
          condition: weatherCondition,
          humidity: current.relative_humidity_2m,
          windSpeed: current.wind_speed_10m,
          timestamp: new Date().toISOString(),
        };

        console.log(`  ✅ Result: ${current.temperature_2m}°C, ${weatherCondition}`);

        return JSON.stringify(result);
      } catch (error) {
        console.error(`  ❌ Weather tool error:`, error);
        return JSON.stringify({
          success: false,
          city,
          error: 'Failed to fetch weather',
          message: (error as any).message,
        });
      }
    },
  });
};
