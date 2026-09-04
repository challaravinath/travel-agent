import { describe, it, expect } from 'vitest';
import { createSafetyTool } from '../../../src/tools/safety/safety.tool';

describe('Safety Tool', () => {
  const tool = createSafetyTool();

  it('should have correct name', () => {
    expect(tool.name).toBe('getSafetyInfo');
  });

  it('should have description', () => {
    expect(tool.description).toBeTruthy();
    expect(tool.description.toLowerCase()).toContain('safety');
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

  it('should get safety info for Paris', async () => {
    const result = await tool.execute({ city: 'Paris' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBe(true);
    expect(parsed.city).toBe('Paris');
    expect(parsed.safetyIndex).toBeTruthy();
    expect(parsed.crimeIndex).toBeTruthy();
  });

  it('should get safety info for Tokyo', async () => {
    const result = await tool.execute({ city: 'Tokyo' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBe(true);
    expect(parsed.safetyIndex).toBeGreaterThan(80);
  });

  it('should return safety structure', async () => {
    const result = await tool.execute({ city: 'London' });
    const parsed = JSON.parse(result);

    if (parsed.success) {
      expect(parsed.safetyIndex).toBeGreaterThanOrEqual(0);
      expect(parsed.safetyIndex).toBeLessThanOrEqual(100);
      expect(parsed.crimeIndex).toBeGreaterThanOrEqual(0);
      expect(parsed.crimeIndex).toBeLessThanOrEqual(100);
      expect(parsed.safetyLevel).toBeTruthy();
      expect(parsed.recommendation).toBeTruthy();
    }
  });

  it('should categorize safety levels', async () => {
    const tokyo = await tool.execute({ city: 'Tokyo' });
    const tokyoData = JSON.parse(tokyo);

    if (tokyoData.success) {
      expect(tokyoData.safetyLevel).toBe('Very Safe');
    }
  });

  it('should handle unknown city', async () => {
    const result = await tool.execute({ city: 'UnknownCity999' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeTruthy();
  });

  it('should compare safety between cities', async () => {
    const tokyo = await tool.execute({ city: 'Tokyo' });
    const delhi = await tool.execute({ city: 'Delhi' });

    const tokyoData = JSON.parse(tokyo);
    const delhiData = JSON.parse(delhi);

    if (tokyoData.success && delhiData.success) {
      expect(tokyoData.safetyIndex).toBeGreaterThan(delhiData.safetyIndex);
    }
  });
});