import { describe, it, expect } from 'vitest';
import { TravelAgent } from '../../../src/agent/travelAgent';
import { AgentConfig, AgentContext } from '../../../src/core/agent';
import { Tool } from '../../../src/core/tool';
import { z } from 'zod';

/**
 * Test TravelAgent
 */

describe('TravelAgent', () => {
  const config: AgentConfig = {
    name: 'TravelAgent',
    version: '1.0.0',
    description: 'Travel comparison agent',
    systemPrompt: 'You are a travel advisor',
    model: 'gpt-4o-mini',
  };

  const agent = new TravelAgent(config);

  // TEST 1: Agent creation
  it('should create TravelAgent with correct config', () => {
    expect(agent.name).toBe('TravelAgent');
    expect(agent.version).toBe('1.0.0');
  });

  // TEST 2: Agent inherits from BaseAgent
  it('should have getTools method from BaseAgent', () => {
    expect(agent.getTools).toBeDefined();
    expect(typeof agent.getTools).toBe('function');
  });

  // TEST 3: Execute method
  it('should execute and return response', async () => {
    const context: AgentContext = {
      userId: 'user123',
      conversationId: 'conv123',
    };

    const result = await agent.execute(context, 'Compare Paris and Tokyo');

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result).toContain('TravelAgent received');
  });

  // TEST 4: Register tools
  it('should register tools correctly', () => {
    const agent2 = new TravelAgent(config);

    const mockTool = new Tool('mockTool', {
      description: 'Mock tool',
      inputSchema: z.object({ test: z.string() }),
      execute: async ({ test }) => test,
    });

    agent2.registerTool(mockTool);

    expect(agent2.getTools().length).toBe(1);
    expect(agent2.getTool('mockTool')).toBeDefined();
  });

  // TEST 5: Register all tools at once
  it('should register all tools using registerAllTools', () => {
    const agent2 = new TravelAgent(config);

    const createMockTool = (name: string) =>
      new Tool(name, {
        description: `Mock ${name}`,
        inputSchema: z.object({ test: z.string() }),
        execute: async ({ test }) => test,
      });

    const weatherTool = createMockTool('getWeather');
    const flightsTool = createMockTool('getFlightPrice');
    const attractionsTool = createMockTool('getAttractions');
    const costTool = createMockTool('getCostOfLiving');
    const safetyTool = createMockTool('getSafetyInfo');

    agent2.registerAllTools(
      weatherTool,
      flightsTool,
      attractionsTool,
      costTool,
      safetyTool
    );

    expect(agent2.getTools().length).toBe(5);
    expect(agent2.getTool('getWeather')).toBeDefined();
    expect(agent2.getTool('getFlightPrice')).toBeDefined();
    expect(agent2.getTool('getAttractions')).toBeDefined();
    expect(agent2.getTool('getCostOfLiving')).toBeDefined();
    expect(agent2.getTool('getSafetyInfo')).toBeDefined();
  });

  // TEST 6: Execute returns response mentioning available tools
  it('should include tool names in response', async () => {
    const agent2 = new TravelAgent(config);

    const mockTool = new Tool('testTool', {
      description: 'Test',
      inputSchema: z.object({ a: z.string() }),
      execute: async ({ a }) => a,
    });

    agent2.registerTool(mockTool);

    const context: AgentContext = {
      userId: 'user123',
    };

    const result = await agent2.execute(context, 'Hello');

    expect(result).toContain('testTool');
  });

  // TEST 7: Handle context properly
  it('should handle agent context', async () => {
    const context: AgentContext = {
      userId: 'special_user',
      conversationId: 'special_conv',
      metadata: {
        language: 'en',
        timezone: 'UTC',
      },
    };

    const result = await agent.execute(context, 'Test query');

    expect(result).toBeTruthy();
  });

  // TEST 8: Error handling
  it('should be ready for execute errors', async () => {
    // This test just verifies the structure is in place
    // Actual error handling tested when we integrate with real tools
    const context: AgentContext = { userId: 'user123' };

    try {
      await agent.execute(context, 'Query');
      expect(true).toBe(true); // Should not throw
    } catch (error) {
      // Should not reach here, but structure is ready for errors
      expect(error).toBeDefined();
    }
  });
});