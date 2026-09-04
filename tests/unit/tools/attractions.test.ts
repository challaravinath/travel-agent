import { describe, it, expect } from 'vitest';
import { createAttractionsToolTool } from '../../../src/tools/attractions/attractions.tool';

describe('Attractions Tool', () => {
  const tool = createAttractionsToolTool();

  it('should have correct name', () => {
    expect(tool.name).toBe('getAttractions');
  });

  it('should have description', () => {
    expect(tool.description).toBeTruthy();
    expect(tool.description.toLowerCase()).toContain('attraction');
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

  it('should get attractions for Paris', async () => {
    const result = await tool.execute({ city: 'Paris' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBe(true);
    expect(parsed.city).toBe('Paris');
    expect(parsed.count).toBeGreaterThan(0);
    expect(parsed.attractions).toBeInstanceOf(Array);
  });

  it('should get attractions for Tokyo', async () => {
    const result = await tool.execute({ city: 'Tokyo' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBe(true);
    expect(parsed.attractions.length).toBeGreaterThan(0);
  });

  it('should return attraction structure', async () => {
    const result = await tool.execute({ city: 'London' });
    const parsed = JSON.parse(result);

    if (parsed.success && parsed.attractions.length > 0) {
      const attraction = parsed.attractions[0];
      expect(attraction.name).toBeTruthy();
      expect(attraction.category).toBeTruthy();
      expect(attraction.rating).toBeTruthy();
      expect(attraction.description).toBeTruthy();
    }
  });

  it('should handle unknown city', async () => {
    const result = await tool.execute({ city: 'UnknownCity999' });
    const parsed = JSON.parse(result);

    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeTruthy();
  });
});