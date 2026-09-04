import { z } from 'zod';
import { Tool } from '../../core/tool';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ValidationService } from '../../services/validation.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * COST OF LIVING TOOL
 *
 * Gets cost of living data for any city
 */

interface CostData {
  city: string;
  country: string;
  meal: number;
  transport: number;
  accommodation: number;
  coffeePrice: number;
  mealBudgetPerDay: number;
}

interface CostsDatabase {
  costs: Record<string, CostData>;
}

let costsDB: CostsDatabase;

try {
  const dataPath = path.join(__dirname, '../../data/costs.json');
  const data = fs.readFileSync(dataPath, 'utf-8');
  costsDB = JSON.parse(data);
  console.log(`✅ Loaded costs database`);
} catch (error) {
  console.error('❌ Failed to load costs database:', error);
  costsDB = { costs: {} };
}

function getCostByCity(city: string): CostData | null {
  return costsDB.costs[city.toLowerCase()] || null;
}

export const createCostOfLivingTool = (): Tool => {
  return new Tool('getCostOfLiving', {
    description:
      'Get cost of living data for any city. Returns meal costs, transport, accommodation prices.',

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

        console.log(`\n💰 Getting cost of living for ${city}...`);

        const cost = getCostByCity(city);

        if (!cost) {
          console.log(`  ❌ Cost data not found`);
          return JSON.stringify({
            success: false,
            city,
            error: 'Cost data not available for this city',
          });
        }

        console.log(`  ✅ Cost data found`);

        return JSON.stringify({
          success: true,
          city: cost.city,
          country: cost.country,
          costs: {
            mealAveragUSD: cost.meal,
            transportPerTripUSD: cost.transport,
            accommodationPerNightUSD: cost.accommodation,
            coffeeUSD: cost.coffeePrice,
            estimatedDailyBudgetUSD: cost.mealBudgetPerDay,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`  ❌ Cost tool error:`, error);
        return JSON.stringify({
          success: false,
          city,
          error: 'Failed to get cost data',
          message: (error as any).message,
        });
      }
    },
  });
};
