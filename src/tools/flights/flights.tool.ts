import { z } from 'zod';
import { Tool } from '../../core/tool';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ValidationService } from '../../services/validation.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * FLIGHTS TOOL
 *
 * Reads airport data from JSON file
 * No hardcoding, data-driven approach
 */

// Load airport data from JSON
interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface Route {
  origin: string;
  destination: string;
  distance: number;
}

interface AirportDatabase {
  airports: Airport[];
  routes: Route[];
}

let airportDB: AirportDatabase;

try {
  const dataPath = path.join(__dirname, '../../data/airports.json');
  const data = fs.readFileSync(dataPath, 'utf-8');
  airportDB = JSON.parse(data);
  console.log(`✅ Loaded ${airportDB.airports.length} airports from database`);
} catch (error) {
  console.error('❌ Failed to load airport database:', error);
  airportDB = { airports: [], routes: [] };
}

/**
 * Get airport by city name
 */
function getAirportByCity(city: string): Airport | null {
  const searchTerm = city.toLowerCase();

  // Try by city name first
  let airport = airportDB.airports.find((airport) => airport.city.toLowerCase() === searchTerm);

  // If not found, try by airport code
  if (!airport) {
    airport = airportDB.airports.find((airport) => airport.code.toLowerCase() === searchTerm);
  }

  return airport || null;
}

/**
 * Get distance between two airports
 */
function getDistance(originCode: string, destCode: string): number {
  const route = airportDB.routes.find(
    (r) =>
      (r.origin === originCode && r.destination === destCode) ||
      (r.origin === destCode && r.destination === originCode)
  );

  return route?.distance || 5000; // Default if not found
}

/**
 * Calculate realistic flight price
 */
function calculatePrice(distance: number, daysUntilTravel: number): number {
  const basePrice = Math.round(distance * 0.12);
  let multiplier = 1;

  if (daysUntilTravel <= 3) multiplier = 2.5;
  else if (daysUntilTravel <= 7) multiplier = 1.8;
  else if (daysUntilTravel <= 14) multiplier = 1.3;
  else if (daysUntilTravel <= 30) multiplier = 1.1;
  else if (daysUntilTravel > 60) multiplier = 0.7;

  return Math.round(basePrice * multiplier);
}

/**
 * Calculate flight duration
 */
function calculateDuration(distance: number): string {
  const hours = Math.round(distance / 900);
  const minutes = Math.floor((distance % 900) / 37.5);
  return `${hours}h ${minutes}m`;
}

/**
 * Get random element
 */
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * CREATE FLIGHTS TOOL
 */
export const createFlightsPriceTool = (): Tool => {
  return new Tool('getFlightPrice', {
    description:
      'Get flight price estimates between any two cities. Returns multiple flight options with different airlines, prices, and durations.',

    inputSchema: z.object({
      origin: z.string().describe('Origin city (e.g., "New York", "Paris")'),
      destination: z.string().describe('Destination city'),
      departureDate: z.string().describe('Departure date in YYYY-MM-DD format'),
    }),

    execute: async ({ origin, destination, departureDate }) => {
      try {
        // STEP 0: Validate input
        const routeValidation = ValidationService.validateRoute(origin, destination);
        if (!routeValidation.valid) {
          return JSON.stringify({
            success: false,
            origin,
            destination,
            error: routeValidation.error,
          });
        }

        const dateValidation = ValidationService.validateDate(departureDate);
        if (!dateValidation.valid) {
          return JSON.stringify({
            success: false,
            origin,
            destination,
            departureDate,
            error: dateValidation.error,
          });
        }
        console.log(`\n✈️  Searching flights: ${origin} → ${destination}`);

        // STEP 1: Get airports
        console.log(`  → Step 1: Finding airports`);
        const originAirport = getAirportByCity(origin);
        const destAirport = getAirportByCity(destination);

        if (!originAirport || !destAirport) {
          console.log(`  ❌ Airport not found`);
          return JSON.stringify({
            success: false,
            origin,
            destination,
            error: 'Airport codes not found for one or both cities',
          });
        }

        console.log(`  ✅ Found: ${originAirport.code} → ${destAirport.code}`);

        // STEP 2: Get distance
        console.log(`  → Step 2: Calculating distance`);
        const distance = getDistance(originAirport.code, destAirport.code);
        console.log(`  ✅ Distance: ${distance} km`);

        // STEP 3: Calculate pricing
        console.log(`  → Step 3: Calculating pricing`);
        const today = new Date();
        const travelDate = new Date(departureDate);
        const daysUntilTravel = Math.ceil(
          (travelDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        const basePrice = calculatePrice(distance, daysUntilTravel);
        console.log(`  ✅ Base price: $${basePrice}`);

        // STEP 4: Generate flight options
        console.log(`  → Step 4: Generating flight options`);
        const airlines = [
          'United',
          'American',
          'Delta',
          'British Airways',
          'Lufthansa',
          'Air France',
          'JAL',
          'ANA',
        ];

        const flights = [];

        for (let i = 0; i < 3; i++) {
          const priceVariation = Math.round(basePrice * (Math.random() * 0.4 - 0.2));
          const finalPrice = basePrice + priceVariation;
          const stops = Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2;

          flights.push({
            id: `FL${i + 1}`,
            airline: randomElement(airlines),
            price: finalPrice,
            currency: 'USD',
            duration: calculateDuration(distance),
            stops,
            rating: (4 + Math.random()).toFixed(1),
          });
        }

        flights.sort((a, b) => a.price - b.price);

        console.log(`  ✅ Generated ${flights.length} options`);

        return JSON.stringify({
          success: true,
          origin: originAirport.name,
          originCode: originAirport.code,
          destination: destAirport.name,
          destCode: destAirport.code,
          departureDate,
          distance: `${distance} km`,
          daysUntilTravel,
          cheapestPrice: flights[0].price,
          currency: 'USD',
          flights,
          source: 'Flight Search (Realistic Pricing)',
        });
      } catch (error) {
        console.error(`  ❌ Flights tool error:`, error);
        return JSON.stringify({
          success: false,
          origin,
          destination,
          error: 'Failed to search flights',
          message: (error as any).message,
        });
      }
    },
  });
};
