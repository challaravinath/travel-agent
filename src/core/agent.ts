import { Tool } from './tool';

/**
 * AGENT CONFIG
 *
 * Configuration for creating an agent
 */
export interface AgentConfig {
  name: string;
  version: string;
  description: string;
  systemPrompt: string;
  model: string;
}

/**
 * AGENT CONTEXT
 *
 * Information about the current conversation
 */
export interface AgentContext {
  userId: string;
  conversationId?: string;
  metadata?: Record<string, any>;
}

/**
 * BASE AGENT
 *
 * Abstract base class for all agents
 *
 * Agents:
 * 1. Have tools (registry)
 * 2. Can register tools
 * 3. Can get tools
 * 4. Can execute (subclasses implement)
 * 5. Provide information
 *
 * Subclasses MUST implement execute()
 */
export abstract class BaseAgent {
  name: string;
  version: string;
  description: string;
  systemPrompt: string;
  model: string;
  protected tools: Map<string, Tool> = new Map();

  constructor(config: AgentConfig) {
    this.name = config.name;
    this.version = config.version;
    this.description = config.description;
    this.systemPrompt = config.systemPrompt;
    this.model = config.model;

    console.log(`🤖 Agent created: ${config.name} (${config.version})`);
  }

  /**
   * Register a tool
   *
   * Add tool to the agent's tool registry
   */
  registerTool(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      console.warn(`⚠️  Tool '${tool.name}' already registered, overwriting`);
    }
    this.tools.set(tool.name, tool);
    console.log(`✅ Registered tool: ${tool.name}`);
  }

  /**
   * Get all tools
   *
   * Return array of all registered tools
   */
  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool by name
   *
   * Find and return specific tool
   */
  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * ABSTRACT METHOD - Subclasses must implement
   *
   * This is what happens when user talks to agent
   * Each agent type (Travel, Finance, HR) implements differently
   */
  abstract execute(context: AgentContext, userInput: string): Promise<string>;

  /**
   * Get agent information
   *
   * Returns metadata about this agent
   */
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      model: this.model,
      toolCount: this.tools.size,
      tools: Array.from(this.tools.keys()),
    };
  }
}
