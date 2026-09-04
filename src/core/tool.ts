import { z } from 'zod';

/**
 * UNDERSTANDING TOOLS
 * 
 * A Tool is:
 * - Something an LLM can call
 * - Has inputs (validated with Zod)
 * - Does something (fetches data, processes, etc)
 * - Returns output as string
 * 
 * Real world example:
 * Tool: getWeather
 * Input: { city: "Paris" }
 * Output: "{"temperature": 18, "condition": "Rainy"}"
 * Every Tool Needs:
 *  // 1. DESCRIPTION (LLM reads this)
    "Get current weather for a city"

    // 2. INPUT SCHEMA (validates what user gives)
    { city: "string" }

    // 3. EXECUTE FUNCTION (does the work)
    async (input) => {
    // Call real API
    // Return result as string
}
 */

export interface ToolConfig {
  description: string;
  inputSchema: z.ZodSchema;
  execute: (input: any) => Promise<string>;
}

export class Tool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  private executeFunc: (input: any) => Promise<string>;

  constructor(name: string, config: ToolConfig) {
    this.name = name;
    this.description = config.description;
    this.inputSchema = config.inputSchema;
    this.executeFunc = config.execute;
    console.log(`✅ Tool created: ${name}`);
  }

  /**
   * Validate input against schema
   *
   * WHY: LLM might give bad input
   * WHAT: Zod checks it's correct
   * HOW: Returns { valid: true/false, error? }
   */
  validateInput(input: any): { valid: boolean; error?: string } {
    try {
      this.inputSchema.parse(input);
      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Execute tool with input
   *
   * PROCESS:
   * 1. Validate input
   * 2. Run execute function
   * 3. Return result
   */
  async execute(input: any): Promise<string> {
    const validation = this.validateInput(input);
    if (!validation.valid) {
      throw new Error(`Invalid input for ${this.name}: ${validation.error}`);
    }

    try {
      return await this.executeFunc(input);
    } catch (error) {
      throw new Error(`Tool execution failed: ${error}`);
    }
  }

  /**
   * Get tool definition for LLM
   *
   * LLM sees this and knows:
   * - My name
   * - What I do
   * - What inputs I accept
   */
  getDefinition() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    };
  }
}
