import { z } from 'zod';
import { Tool } from '../../core/tool';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ValidationService } from '../../services/validation.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SAFETY TOOL
 *
 * Gets safety information for any city
 */

interface SafetyData {
  city: string;
  country: string;
  safetyIndex: number;
  crimeIndex: number;
  recommendation: string;
}

interface SafetyDatabase {
  safety: Record<string, SafetyData>;
}

let safetyDB: SafetyDatabase;

try {
  const dataPath = path.join(__dirname, '../../data/safety.json');
  const data = fs.readFileSync(dataPath, 'utf-8');
  safetyDB = JSON.parse(data);
  console.log(`✅ Loaded safety database`);
} catch (error) {
  console.error('❌ Failed to load safety database:', error);
  safetyDB = { safety: {} };
}

function getSafetyByCity(city: string): SafetyData | null {
  return safetyDB.safety[city.toLowerCase()] || null;
}

export const createSafetyTool = (): Tool => {
  return new Tool('getSafetyInfo', {
    description:
      'Get safety information for any city. Returns safety index, crime rate, and travel recommendations.',

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

        console.log(`\n🛡️  Getting safety info for ${city}...`);

        const safety = getSafetyByCity(city);

        if (!safety) {
          console.log(`  ❌ Safety data not found`);
          return JSON.stringify({
            success: false,
            city,
            error: 'Safety data not available for this city',
          });
        }

        console.log(`  ✅ Safety data found`);

        const safetyLevel =
          safety.safetyIndex >= 80
            ? 'Very Safe'
            : safety.safetyIndex >= 70
              ? 'Safe'
              : safety.safetyIndex >= 60
                ? 'Moderately Safe'
                : 'Use Caution';

        return JSON.stringify({
          success: true,
          city: safety.city,
          country: safety.country,
          safetyIndex: safety.safetyIndex,
          crimeIndex: safety.crimeIndex,
          safetyLevel,
          recommendation: safety.recommendation,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`  ❌ Safety tool error:`, error);
        return JSON.stringify({
          success: false,
          city,
          error: 'Failed to get safety info',
          message: (error as any).message,
        });
      }
    },
  });
};
