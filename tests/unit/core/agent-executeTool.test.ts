import { describe, it, expect, beforeEach } from 'vitest';
import { BaseAgent, AgentConfig, AgentContext } from '../../../src/core/agent';
import { Tool } from '../../../src/core/tool';
import { metricsService } from '../../../src/services/metrics.service';
import { costService } from '../../../src/services/cost.service';
import { z } from 'zod';

class TestAgent extends BaseAgent {
    async execute(context: AgentContext, userInput: string): Promise<string> {
        return 'test response';
    }
}

describe('BaseAgent.executeTool()', () => {
    let agent: TestAgent;

    beforeEach(() => {
        const config: AgentConfig = {
            name: 'TestAgent',
            version: '1.0.0',
            description: 'test',
            systemPrompt: 'test',
            model: 'test-model',
        };
        agent = new TestAgent(config);
    });
    it('should automatically record metrics when a tool succeeds', async () => {
        metricsService.reset();

        const testTool = new Tool('getWeather', {
            description: 'A test tool',
            inputSchema: z.object({}),
            execute: async () => JSON.stringify({ success: true }),
        });

        agent.registerTool(testTool);
        await agent.executeTool('getWeather', {});

        const toolMetrics = metricsService.getEntries().filter(e => e.toolName === 'getWeather');
        expect(toolMetrics).toHaveLength(1);
        expect(toolMetrics[0].success).toBe(true);
    });

    it('should execute a registered tool successfully', async () => {
        const testTool = new Tool('getWeather', {
            description: 'A test tool',
            inputSchema: z.object({}),
            execute: async () => JSON.stringify({ success: true, message: 'ok' }),
        });

        agent.registerTool(testTool);

        const result = await agent.executeTool('getWeather', {});

        expect(result.success).toBe(true);
        expect(result.data).toContain('ok');
    });
    it('should automatically record cost when a tool succeeds', async () => {
        costService.reset();

        const testTool = new Tool('getWeather', {
            description: 'A test tool',
            inputSchema: z.object({}),
            execute: async () => JSON.stringify({ success: true }),
        });

        agent.registerTool(testTool);
        await agent.executeTool('getWeather', {});

        const costEntries = costService.getEntries().filter(e => e.toolName === 'getWeather');
        expect(costEntries).toHaveLength(1);
    });
});