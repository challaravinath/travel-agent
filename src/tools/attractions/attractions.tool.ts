import { z } from 'zod';
import { Tool } from '../../core/tool';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ValidationService } from '../../services/validation.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ATTRACTIONS TOOL
 *
 * Gets top attractions for any city
 * Reads from JSON database
 */

interface Attraction {
  name: string;
  category: string;
  rating: number;
  visitorsPerYear: string;
  description: string;
}

interface AttractionsDatabase {
  attractions: Record<string, Attraction[]>;
}

let attractionsDB: AttractionsDatabase;

try {
  const dataPath = path.join(__dirname, '../../data/attractions.json');
  const data = fs.readFileSync(dataPath, 'utf-8');
  attractionsDB = JSON.parse(data);
  console.log(`✅ Loaded attractions database`);
} catch (error) {
  console.error('❌ Failed to load attractions database:', error);
  attractionsDB = { attractions: {} };
}

function getAttractionsByCity(city: string): Attraction[] {
  return attractionsDB.attractions[city.toLowerCase()] || [];
}

export const createAttractionsToolTool = (): Tool => {
  return new Tool('getAttractions', {
    description:
      'Get top attractions for any city. Returns popular tourist sites with ratings, visitor numbers, and descriptions.',

    inputSchema: z.object({
      city: z.string().describe('City name (e.g., "Paris", "Tokyo")'),
    }),

    execute: async ({ city }) => {
      try {
        // STEP 0: Validate input
        const validation = ValidationService.validateCity(city);
        if (!validation.valid) {
          return JSON.stringify({
            success: false,
            city,
            error: validation.error,
          });
        }

        console.log(`\n🏛️  Getting attractions for ${city}...`);

        const attractions = getAttractionsByCity(city);

        if (attractions.length === 0) {
          console.log(`  ❌ No attractions found`);
          return JSON.stringify({
            success: false,
            city,
            error: 'No attractions found for this city',
          });
        }

        console.log(`  ✅ Found ${attractions.length} attractions`);

        return JSON.stringify({
          success: true,
          city,
          count: attractions.length,
          attractions: attractions.slice(0, 5),
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`  ❌ Attractions tool error:`, error);
        return JSON.stringify({
          success: false,
          city,
          error: 'Failed to get attractions',
          message: (error as any).message,
        });
      }
    },
  });
};
