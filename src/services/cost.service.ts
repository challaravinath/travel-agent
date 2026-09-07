export interface CostEntry {
  toolName: string; // e.g., 'getWeather'
  amountUSD: number; // Changed from cost to amountUSD to match your method below
  timestamp: string; // e.g., '2026-09-06T19:32:00Z'
}

export type AllowedToolNames =
  'getWeather' | 'getFlightPrice' | 'getAttractions' | 'getCostOfLiving' | 'getSafetyInfo';

const PRICING: Record<AllowedToolNames, number> = {
  getWeather: 0,
  getFlightPrice: 0,
  getAttractions: 0,
  getCostOfLiving: 0,
  getSafetyInfo: 0,
};

class CostService {
  private costs: CostEntry[] = [];

  recordCost(toolName: AllowedToolNames): CostEntry {
    // 1. Look up the price from PRICING (Guaranteed to exist by TypeScript!)
    const amountUSD = PRICING[toolName];

    // 2. Build a complete CostEntry object
    const entry: CostEntry = {
      toolName,
      amountUSD,
      timestamp: new Date().toISOString(),
    };

    // 3. Push it into our internal ledger array
    this.costs.push(entry);

    // 4. Return the entry for validation or logging
    return entry;
  }

  /**
   * Calculate the total financial expenditure across all tools
   */
  getTotalCost(): number {
    return this.costs.reduce((sum, entry) => sum + entry.amountUSD, 0);
  }
  getEntries(): CostEntry[] {
    return [...this.costs];
  }

  /**
   * Calculate the average cost across all recorded tool executions
   */
  getAverageCost(): number | null {
    // 1. Guard: If no tools have been called, return null to avoid 0/0 division (NaN)
    if (this.costs.length === 0) {
      return null;
    }

    // 2. Reuse your addition logic to get total spend and divide by total entries
    return this.getTotalCost() / this.costs.length;
  }

  /**
   * Calculate the total expenditure for a specific tool
   */
  getCostByTool(toolName: AllowedToolNames): number {
    // 1. Filter entries down to only the records that match this specific tool name
    const toolEntries = this.costs.filter((entry) => entry.toolName === toolName);

    // 2. Sum their amountUSD values together (returns 0 automatically if the array is empty)
    return toolEntries.reduce((sum, entry) => sum + entry.amountUSD, 0);
  }

  /**
   * Completely clear out all recorded performance metrics logs.
   * Crucial for resetting state between isolated unit tests.
   */
  reset(): void {
    this.costs = [];
  }
}

export const costService = new CostService();
export { CostService };
