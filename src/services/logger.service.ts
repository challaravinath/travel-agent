import pino from 'pino';

/**
 * LOGGER SERVICE
 *
 * Structured logging for the entire application
 *
 * Why structured logging?
 * - Easy to search in logs
 * - Easy to parse
 * - Can aggregate metrics
 * - Professional
 *
 * Usage:
 * const logger = new Logger('TravelAgent');
 * logger.info('Something happened', { userId: '123', duration: 100 });
 *
 * Output (JSON):
 * {"level":30,"time":1234567890,"context":"TravelAgent","msg":"Something happened","userId":"123","duration":100}
 */

export class Logger {
  private logger: pino.Logger;

  constructor(context: string) {
    // Create logger with pretty printing
    this.logger = pino(
      {
        level: process.env.LOG_LEVEL || 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: false,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      },
      pino.destination()
    );

    // Add context (which class/module)
    this.logger = this.logger.child({ context });
  }

  /**
   * INFO - General information
   *
   * Example:
   * logger.info('Tool executed', { tool: 'getWeather', duration: 100 });
   *
   * Output:
   * [09:45:23] INFO (TravelAgent): Tool executed
   *   tool: "getWeather"
   *   duration: 100
   */
  info(message: string, data?: Record<string, any>): void {
    this.logger.info({ ...data }, message);
  }

  /**
   * WARN - Warning information
   *
   * Example:
   * logger.warn('Tool took long time', { duration: 5000 });
   */
  warn(message: string, data?: Record<string, any>): void {
    this.logger.warn({ ...data }, message);
  }

  /**
   * ERROR - Something went wrong
   *
   * Example:
   * logger.error('Tool failed', error, { tool: 'getWeather' });
   */
  error(message: string, error?: Error | string, data?: Record<string, any>): void {
    this.logger.error(
      {
        error: typeof error === 'string' ? error : error?.message,
        stack: error instanceof Error ? error.stack : undefined,
        ...data,
      },
      message
    );
  }

  /**
   * DEBUG - Detailed debugging info
   *
   * Only shows if LOG_LEVEL=debug
   *
   * Example:
   * logger.debug('Detailed info', { step: 1, value: 'test' });
   */
  debug(message: string, data?: Record<string, any>): void {
    this.logger.debug({ ...data }, message);
  }

  /**
   * LOG TOOL CALL
   *
   * Convenient method for logging tool executions
   *
   * Example:
   * logger.logToolCall('getWeather', { city: 'Paris' }, 234, true);
   */
  logToolCall(
    toolName: string,
    input: Record<string, any>,
    duration: number,
    success: boolean,
    error?: string
  ): void {
    if (success) {
      this.info(`Tool executed: ${toolName}`, {
        tool: toolName,
        durationMs: duration,
        input,
      });
    } else {
      this.error(`Tool failed: ${toolName}`, error, {
        tool: toolName,
        durationMs: duration,
        input,
      });
    }
  }

  /**
   * LOG CONVERSATION
   *
   * Convenient method for logging conversations
   *
   * Example:
   * logger.logConversation('user123', 'Compare Paris and Tokyo', 5, 0.024);
   */
  logConversation(userId: string, userQuery: string, toolCount: number, totalCost: number): void {
    this.info(`Conversation completed`, {
      userId,
      queryLength: userQuery.length,
      toolCount,
      totalCostUSD: totalCost,
    });
  }
}

/**
 * EXPORT FUNCTION
 *
 * Alternative way to create logger
 *
 * Usage:
 * const logger = createLogger('MyClass');
 */
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};
