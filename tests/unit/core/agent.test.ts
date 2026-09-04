import { describe, it, expect } from 'vitest';
import { BaseAgent, AgentConfig, AgentContext } from '../../../src/core/agent';
import { Tool } from '../../../src/core/tool';
import { z } from 'zod';

/**
 * Test BaseAgent
 */

// Create a test implementation of BaseAgent
class TestAgent extends BaseAgent {
  async execute(context: AgentContext, userInput: string): Promise<string> {
    return `Executed: ${userInput}`;
  }
}

describe('BaseAgent', () => {
  const config: AgentConfig = {
    name: 'TestAgent',
    version: '1.0.0',
    description: 'A test agent',
    systemPrompt: 'You are a test agent',
    model: 'gpt-4o-mini',
  };

  const agent = new TestAgent(config);

  it('should create agent with correct config', () => {
    expect(agent.name).toBe('TestAgent');
    expect(agent.version).toBe('1.0.0');
    expect(agent.description).toBe('A test agent');
  });

  it('should have empty tools initially', () => {
    expect(agent.getTools().length).toBe(0);
  });

  it('should register tool', () => {
    const tool = new Tool('testTool', {
      description: 'A test tool',
      inputSchema: z.object({ input: z.string() }),
      execute: async ({ input }) => input,
    });

    agent.registerTool(tool);
    expect(agent.getTools().length).toBe(1);
  });

  it('should get tool by name', () => {
    const tool = new Tool('getWeather', {
      description: 'Get weather',
      inputSchema: z.object({ city: z.string() }),
      execute: async ({ city }) => city,
    });

    agent.registerTool(tool);
    const retrieved = agent.getTool('getWeather');
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('getWeather');
  });

  it('should return undefined for non-existent tool', () => {
    const tool = agent.getTool('nonExistent');
    expect(tool).toBeUndefined();
  });

  it('should get agent info', () => {
    const info = agent.getInfo();
    expect(info.name).toBe('TestAgent');
    expect(info.version).toBe('1.0.0');
    expect(info.model).toBe('gpt-4o-mini');
    expect(info.toolCount).toBeGreaterThan(0);
    expect(info.tools).toBeInstanceOf(Array);
  });

  it('should execute using abstract method', async () => {
    const context: AgentContext = {
      userId: 'user123',
      conversationId: 'conv123',
    };

    const result = await agent.execute(context, 'Test input');
    expect(result).toBe('Executed: Test input');
  });

  it('should handle multiple tools', () => {
    const agent2 = new TestAgent(config);

    const tool1 = new Tool('tool1', {
      description: 'Tool 1',
      inputSchema: z.object({ a: z.string() }),
      execute: async ({ a }) => a,
    });

    const tool2 = new Tool('tool2', {
      description: 'Tool 2',
      inputSchema: z.object({ b: z.string() }),
      execute: async ({ b }) => b,
    });

    agent2.registerTool(tool1);
    agent2.registerTool(tool2);

    expect(agent2.getTools().length).toBe(2);
    expect(agent2.getTool('tool1')).toBeDefined();
    expect(agent2.getTool('tool2')).toBeDefined();
  });
});