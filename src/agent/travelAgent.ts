import { BaseAgent, AgentConfig, AgentContext } from '../core/agent';
import { Logger } from '../services/logger.service';
import { Tool } from '../core/tool';

/**
 * TRAVEL AGENT
 *
 * A concrete implementation of BaseAgent
 *
 * Purpose:
 * - Help users compare travel destinations
 * - Use tools: weather, flights, attractions, costs, safety
 * - Synthesize data into recommendation
 *
 * Example usage:
 * const agent = new TravelAgent({
 *   name: "TravelAgent",
 *   version: "1.0.0",
 *   description: "Travel comparison agent",
 *   systemPrompt: "You are a travel advisor...",
 *   model: "gpt-4o-mini"
 * });
 *
 * agent.registerAllTools(...tools);
 * const result = await agent.execute(context, "Compare Paris and Tokyo");
 */

export class TravelAgent extends BaseAgent {
  private logger: Logger;

  constructor(config: AgentConfig) {
    super(config);
    this.logger = new Logger('TravelAgent');
    this.logger.info(`TravelAgent initialized`, { version: config.version });
  }

  /**
   * EXECUTE
   *
   * Main method - what happens when user asks something
   *
   * Process:
   * 1. Log query
   * 2. Process (we'll add this later)
   * 3. Return response
   * 4. Handle errors
   */
  async execute(context: AgentContext, userInput: string): Promise<string> {
    try {
      this.logger.info(`Executing query`, {
        userId: context.userId,
        conversationId: context.conversationId,
        queryLength: userInput.length,
      });

      // Generate response
      const response = `TravelAgent received: "${userInput}"
        Tools available: ${this.getTools()
          .map((t) => t.name)
          .join(', ')}`;

      this.logger.info(`Query executed successfully`, {
        responseLength: response.length,
      });

      return response;
    } catch (error) {
      this.logger.error(`Query execution failed`, error as Error);
      throw error;
    }
  }

  /**
   * REGISTER ALL TOOLS
   *
   * Convenience method to register all tools at once
   */
  registerAllTools(
    weatherTool: Tool,
    flightsTool: Tool,
    attractionsTool: Tool,
    costTool: Tool,
    safetyTool: Tool
  ): void {
    this.logger.info(`Registering tools for TravelAgent`);

    this.registerTool(weatherTool);
    this.registerTool(flightsTool);
    this.registerTool(attractionsTool);
    this.registerTool(costTool);
    this.registerTool(safetyTool);

    this.logger.info(`All tools registered`, {
      toolCount: this.getTools().length,
      toolNames: this.getTools().map((t) => t.name),
    });
  }
}
