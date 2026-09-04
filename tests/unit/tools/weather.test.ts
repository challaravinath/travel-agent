import { describe, it, expect } from 'vitest';
import { createWeatherTool } from '../../../src/tools/weather/weather.tool';

/**
 * Test Weather Tool
 * Tests actual API calls to Open-Meteo
 */

describe('Weather Tool', () => {
  const tool = createWeatherTool();

  // TEST 1: Tool properties
  it('should have correct name', () => {
    expect(tool.name).toBe('getWeather');
  });

  it('should have description', () => {
    expect(tool.description).toBeTruthy();
    expect(tool.description.toLowerCase()).toContain('weather');
  });

  // TEST 2: Input validation
  it('should validate input correctly', () => {
    const validation = tool.validateInput({ city: 'Paris' });
    expect(validation.valid).toBe(true);
  });

  it('should reject missing city', () => {
    const validation = tool.validateInput({});
    expect(validation.valid).toBe(false);
  });

  it('should reject invalid input type', () => {
    const validation = tool.validateInput({ city: 123 });
    expect(validation.valid).toBe(false);
  });

  // TEST 3: Real API calls (these actually call Open-Meteo)
  it('should fetch real weather for London', async () => {
    const result = await tool.execute({ city: 'London' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBe(true);
    expect(parsed.city).toBeTruthy();
    expect(parsed.temperature).toBeTruthy();
    expect(parsed.condition).toBeTruthy();
    expect(parsed.humidity).toBeTruthy();
    expect(parsed.windSpeed).toBeTruthy();
  });

  it('should fetch real weather for Paris', async () => {
    const result = await tool.execute({ city: 'Paris' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBe(true);
    expect(parsed.city).toMatch(/Paris/i);
    expect(parsed.temperature).toBeGreaterThan(-50);
    expect(parsed.temperature).toBeLessThan(60);
  });

  it('should fetch real weather for Tokyo', async () => {
    const result = await tool.execute({ city: 'Tokyo' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBe(true);
    expect(parsed.city).toMatch(/Tokyo/i);
  });

  // TEST 4: Error handling
  it('should handle non-existent city', async () => {
    const result = await tool.execute({ city: 'XyZzZz999999NotReal' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeTruthy();
  });

  // TEST 5: Output format
  it('should return JSON string', async () => {
    const result = await tool.execute({ city: 'New York' });
    expect(typeof result).toBe('string');
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('should have timestamp in response', async () => {
    const result = await tool.execute({ city: 'Barcelona' });
    const parsed = JSON.parse(result);
    expect(parsed.timestamp).toBeTruthy();
  });

  it('should have all expected fields', async () => {
    const result = await tool.execute({ city: 'Sydney' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBeDefined();
    expect(parsed.city).toBeDefined();
    expect(parsed.country).toBeDefined();
    expect(parsed.latitude).toBeDefined();
    expect(parsed.longitude).toBeDefined();
    expect(parsed.temperature).toBeDefined();
    expect(parsed.apparentTemperature).toBeDefined();
    expect(parsed.condition).toBeDefined();
    expect(parsed.humidity).toBeDefined();
    expect(parsed.windSpeed).toBeDefined();
  });
});