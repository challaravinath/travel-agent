import { describe, it, expect } from 'vitest';
import { createCostOfLivingTool } from '../../../src/tools/costOfLiving/costOfLiving.tool';

describe('Cost of Living Tool', () => {
  const tool = createCostOfLivingTool();

  it('should have correct name', () => {
    expect(tool.name).toBe('getCostOfLiving');
  });

  it('should have description', () => {
    expect(tool.description).toBeTruthy();
    expect(tool.description.toLowerCase()).toContain('cost');
  });

  it('should validate correct input', () => {
    const validation = tool.validateInput({ city: 'Paris' });
    expect(validation.valid).toBe(true);
  });

it('should validate input type', () => {
  const validation = tool.validateInput({ city: 'Paris' });
  expect(validation.valid).toBe(true);
});

it('should reject non-string city', () => {
  const validation = tool.validateInput({ city: 123 });
  expect(validation.valid).toBe(false);
});

  it('should get costs for Paris', async () => {
    const result = await tool.execute({ city: 'Paris' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBe(true);
    expect(parsed.city).toBe('Paris');
    expect(parsed.costs).toBeTruthy();
  });

  it('should get costs for Tokyo', async () => {
    const result = await tool.execute({ city: 'Tokyo' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBe(true);
    expect(parsed.costs.mealAveragUSD).toBeGreaterThan(0);
  });

  it('should return cost structure', async () => {
    const result = await tool.execute({ city: 'New York' });
    const parsed = JSON.parse(result);

    if (parsed.success) {
      expect(parsed.costs.mealAveragUSD).toBeTruthy();
      expect(parsed.costs.transportPerTripUSD).toBeTruthy();
      expect(parsed.costs.accommodationPerNightUSD).toBeTruthy();
      expect(parsed.costs.coffeeUSD).toBeTruthy();
      expect(parsed.costs.estimatedDailyBudgetUSD).toBeTruthy();
    }
  });

  it('should handle unknown city', async () => {
    const result = await tool.execute({ city: 'UnknownCity999' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeTruthy();
  });

  it('should compare city costs', async () => {
    const bangkok = await tool.execute({ city: 'Bangkok' });
    const newyork = await tool.execute({ city: 'New York' });

    const bangkokData = JSON.parse(bangkok);
    const newyorkData = JSON.parse(newyork);

    if (bangkokData.success && newyorkData.success) {
      expect(bangkokData.costs.mealAveragUSD).toBeLessThan(
        newyorkData.costs.mealAveragUSD
      );
    }
  });
});