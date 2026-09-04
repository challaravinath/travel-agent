import { describe, it, expect } from 'vitest';
import { Tool } from '../../../src/core/tool';
import { z } from 'zod';

describe('Tool', () => {
  // Create a simple test tool
  const testTool = new Tool('testTool', {
    description: 'A test tool',
    inputSchema: z.object({
      name: z.string(),
      age: z.number(),
    }),
    execute: async ({ name, age }) => {
      return JSON.stringify({ name, age, processed: true });
    },
  });

  it('should create tool with correct name', () => {
    expect(testTool.name).toBe('testTool');
  });

  it('should have description', () => {
    expect(testTool.description).toBe('A test tool');
  });

  it('should validate correct input', () => {
    const result = testTool.validateInput({ name: 'John', age: 30 });
    expect(result.valid).toBe(true);
  });

  it('should reject invalid input type', () => {
    const result = testTool.validateInput({ name: 'John', age: 'thirty' });
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should reject missing field', () => {
    const result = testTool.validateInput({ name: 'John' });
    expect(result.valid).toBe(false);
  });

  it('should execute with valid input', async () => {
    const result = await testTool.execute({ name: 'John', age: 30 });
    const parsed = JSON.parse(result);
    expect(parsed.name).toBe('John');
    expect(parsed.age).toBe(30);
    expect(parsed.processed).toBe(true);
  });

  it('should throw on invalid input', async () => {
    try {
      await testTool.execute({ name: 'John', age: 'invalid' });
      expect.fail('Should have thrown');
    } catch (error) {
      expect((error as Error).message).toContain('Invalid input');
    }
  });

  it('should return definition', () => {
    const def = testTool.getDefinition();
    expect(def.name).toBe('testTool');
    expect(def.description).toBe('A test tool');
    expect(def.inputSchema).toBeTruthy();
  });
});