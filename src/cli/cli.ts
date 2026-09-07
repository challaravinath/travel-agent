import readline from 'readline';
import { createWeatherTool } from '../tools/weather/weather.tool';
import { createFlightsPriceTool } from '../tools/flights/flights.tool';
import { createAttractionsToolTool } from '../tools/attractions/attractions.tool';
import { createCostOfLivingTool } from '../tools/costOfLiving/costOfLiving.tool';
import { createSafetyTool } from '../tools/safety/safety.tool';
import { TravelAgent } from '../agent/travelAgent';
import { AgentConfig } from '../core/agent';
import { Logger } from '../services/logger.service';
import { metricsService } from '../services/metrics.service';
import { costService } from '../services/cost.service';

/**
 * CLI INTERFACE
 *
 * Command-line interface to test all 5 tools interactively
 *
 * Tools:
 * - Weather (real API)
 * - Flights (smart pricing)
 * - Attractions (JSON data)
 * - Cost of Living (JSON data)
 * - Safety (JSON data)
 */

const logger = new Logger('CLI');

// ============================================
// SETUP AGENT
// ============================================

const agentConfig: AgentConfig = {
  name: 'TravelAgent',
  version: '1.0.0',
  description: 'AI-powered travel advisor',
  systemPrompt: 'You are a helpful travel advisor. Use tools to help users.',
  model: 'gpt-4o-mini',
};

const agent = new TravelAgent(agentConfig);

// Register all tools
const weatherTool = createWeatherTool();
const flightsTool = createFlightsPriceTool();
const attractionsTool = createAttractionsToolTool();
const costsTool = createCostOfLivingTool();
const safetyTool = createSafetyTool();

agent.registerTool(weatherTool);
agent.registerTool(flightsTool);
agent.registerTool(attractionsTool);
agent.registerTool(costsTool);
agent.registerTool(safetyTool);

// ============================================
// COMMAND HANDLERS
// ============================================

async function handleWeather(args: string[]) {
  if (args.length === 0) {
    console.log('❌ Usage: weather [city]');
    console.log('Example: weather Paris');
    return;
  }

  const city = args.join(' ');
  logger.info(`User requested weather for: ${city}`);

  const result = await agent.executeTool('getWeather', { city });

  if (!result.success || !result.data) {
    console.log(`❌ Error: ${result.error}`);
    return;
  }

  const parsed = JSON.parse(result.data);

  console.log(`
✅ Weather Data:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📍 Location: ${parsed.city}, ${parsed.country}
  🌡️  Temperature: ${parsed.temperature}°C
  ☁️  Condition: ${parsed.condition}
  💧 Humidity: ${parsed.humidity}%
  💨 Wind: ${parsed.windSpeed} km/h
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

async function handleFlights(args: string[]) {
  if (args.length < 2) {
    console.log(`
❌ Invalid format!

Usage: flights [origin-code-destination-code] [date]

Examples:
  flights jfk-cdg 2026-09-20
  flights lhr-nrt 2026-09-20
  flights sin-syd 2026-10-15

City Codes:
  Paris: CDG | London: LHR | Tokyo: NRT | New York: JFK
  Sydney: SYD | Dubai: DXB | Singapore: SIN | Bangkok: BKK
    `);
    return;
  }

  const route = args[0];
  const parts = route.split('-');

  if (parts.length !== 2) {
    console.log(`❌ Invalid format. Use: origin-destination (e.g., jfk-cdg)`);
    return;
  }

  const origin = parts[0].trim().toUpperCase();
  const destination = parts[1].trim().toUpperCase();
  const departureDate = args[1] || '2026-09-20';

  if (origin.length < 2 || destination.length < 2) {
    console.log(`❌ Airport codes must be 2-3 characters (e.g., JFK, CDG)`);
    return;
  }

  logger.info(`User searched flights: ${origin} → ${destination}`);

  try {
    const startTime = Date.now();
    const result = await agent.executeTool('getFlightPrice', {
      origin: origin.toLowerCase(),
      destination: destination.toLowerCase(),
      departureDate,
    });
    const duration = Date.now() - startTime;

    if (!result.success || !result.data) {
      console.log(`❌ Error: ${result.error}`);
      return;
    }

    const parsed = JSON.parse(result.data);

    if (parsed.success) {
      console.log(`
✅ Flight Search Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✈️  ${parsed.originCode} → ${parsed.destCode}
  📅 Date: ${parsed.departureDate}
  📏 Distance: ${parsed.distance}
  💵 Cheapest: $${parsed.cheapestPrice}

  Options:
      `);

      parsed.flights.forEach((flight: any, i: number) => {
        console.log(`
  ${i + 1}. ${flight.airline}
     Price: $${flight.price} | Duration: ${flight.duration} | Stops: ${flight.stops} | ⭐ ${flight.rating}
      `);
      });

      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  Time: ${duration}ms
      `);
      logger.logToolCall('getFlightPrice', { origin, destination, departureDate }, duration, true);
    } else {
      console.log(`❌ Error: ${parsed.error}`);
      logger.logToolCall('getFlightPrice', { origin, destination }, duration, false, parsed.error);
    }
  } catch (error) {
    console.log(`❌ Error: ${error}`);
    logger.error('Flights command failed', error as Error);
  }
}

async function handleAttractions(args: string[]) {
  if (args.length === 0) {
    console.log('❌ Usage: attractions [city]');
    console.log('Example: attractions Paris');
    return;
  }

  const city = args.join(' ');
  logger.info(`User requested attractions for: ${city}`);

  const result = await agent.executeTool('getAttractions', { city });

  if (!result.success || !result.data) {
    console.log(`❌ Error: ${result.error}`);
    return;
  }

  const parsed = JSON.parse(result.data);

  console.log(`
✅ Top Attractions in ${parsed.city}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  parsed.attractions.forEach((attraction: any, i: number) => {
    console.log(`
  ${i + 1}. ${attraction.name}
     Category: ${attraction.category}
     Rating: ⭐ ${attraction.rating}
     Visitors/Year: ${attraction.visitorsPerYear}
     ${attraction.description}
    `);
  });
}

async function handleCosts(args: string[]) {
  if (args.length === 0) {
    console.log('❌ Usage: costs [city]');
    console.log('Example: costs Bangkok');
    return;
  }

  const city = args.join(' ');
  logger.info(`User requested costs for: ${city}`);

  try {
    const startTime = Date.now();
    const result = await agent.executeTool('getCostOfLiving', { city });
    const duration = Date.now() - startTime;

    if (!result.success || !result.data) {
      console.log(`❌ Error: ${result.error}`);
      return;
    }

    const parsed = JSON.parse(result.data);

    if (parsed.success) {
      console.log(`
✅ Cost of Living - ${parsed.city}, ${parsed.country}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🍽️  Average Meal: $${parsed.costs.mealAveragUSD}
  🚌 Transport Trip: $${parsed.costs.transportPerTripUSD}
  🏨 Accommodation/Night: $${parsed.costs.accommodationPerNightUSD}
  ☕ Coffee: $${parsed.costs.coffeeUSD}
  💰 Est. Daily Budget: $${parsed.costs.estimatedDailyBudgetUSD}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  Time: ${duration}ms
      `);
      logger.logToolCall('getCostOfLiving', { city }, duration, true);
    } else {
      console.log(`❌ Error: ${parsed.error}`);
      logger.logToolCall('getCostOfLiving', { city }, duration, false, parsed.error);
    }
  } catch (error) {
    console.log(`❌ Error: ${error}`);
    logger.error('Costs command failed', error as Error);
  }
}

async function handleSafety(args: string[]) {
  if (args.length === 0) {
    console.log('❌ Usage: safety [city]');
    console.log('Example: safety Tokyo');
    return;
  }

  const city = args.join(' ');
  logger.info(`User requested safety info for: ${city}`);

  try {
    const startTime = Date.now();
    const result = await agent.executeTool('getSafetyInfo', { city });
    const duration = Date.now() - startTime;

    if (!result.success || !result.data) {
      console.log(`❌ Error: ${result.error}`);
      return;
    }

    const parsed = JSON.parse(result.data);

    if (parsed.success) {
      console.log(`
✅ Safety Info - ${parsed.city}, ${parsed.country}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🛡️  Safety Index: ${parsed.safetyIndex}/100 (${parsed.safetyLevel})
  ⚠️  Crime Index: ${parsed.crimeIndex}/100
  📝 Recommendation: ${parsed.recommendation}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  Time: ${duration}ms
      `);
      logger.logToolCall('getSafetyInfo', { city }, duration, true);
    } else {
      console.log(`❌ Error: ${parsed.error}`);
      logger.logToolCall('getSafetyInfo', { city }, duration, false, parsed.error);
    }
  } catch (error) {
    console.log(`❌ Error: ${error}`);
    logger.error('Safety command failed', error as Error);
  }
}

function handleInfo() {
  const info = agent.getInfo();
  console.log(`
📊 Agent Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Name: ${info.name}
  Version: ${info.version}
  Model: ${info.model}
  Tools: ${info.toolCount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

function handleTools() {
  console.log(`
🛠️  Available Tools:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  agent.getTools().forEach((tool, i) => {
    console.log(`  ${i + 1}. ${tool.name}`);
    console.log(`     ${tool.description}\n`);
  });
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

function displayMenu() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  TRAVEL AGENT - CLI                            ║
║          Simple Tool Calling with Observability                ║
╚════════════════════════════════════════════════════════════════╝

📋 Commands:
  weather [city]              - Get weather for city
  flights [code-code] [date]  - Search flights
  attractions [city]          - Get attractions
  costs [city]                - Cost of living
  safety [city]               - Safety information
  info                        - Show agent info
  tools                       - List all tools
  help                        - Show this menu
  exit                        - Exit CLI

📍 Examples:
  weather Paris
  flights jfk-cdg 2026-09-20
  attractions Tokyo
  costs Bangkok
  safety Singapore

💡 Airport Codes:
  Paris: CDG | London: LHR | Tokyo: NRT | New York: JFK
  Sydney: SYD | Dubai: DXB | Singapore: SIN | Bangkok: BKK
  `);
}

function handleStats() {
  const metrics = metricsService.getOverallSummary();
  const totalCost = costService.getTotalCost();
  const avgCost = costService.getAverageCost();

  console.log(`
📊 System Stats:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Calls:        ${metrics.totalCalls}
  Success Rate:       ${metrics.overallSuccessRate !== null ? metrics.overallSuccessRate.toFixed(1) + '%' : 'No data yet'}
  Avg Response Time:  ${metrics.overallAvgDuration !== null ? metrics.overallAvgDuration.toFixed(0) + 'ms' : 'No data yet'}

  Total Cost:         $${totalCost.toFixed(4)}
  Avg Cost/Call:      ${avgCost !== null ? '$' + avgCost.toFixed(4) : 'No data yet'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

// ============================================
// RUN CLI
// ============================================

async function runCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  console.log('\n🚀 Starting Travel Agent CLI...\n');
  displayMenu();
  logger.info('CLI started');

  while (true) {
    const input = await question('\n> ');
    const [command, ...args] = input.trim().toLowerCase().split(' ');

    if (!command) continue;

    switch (command) {
      case 'weather':
        await handleWeather(args);
        break;
      case 'flights':
        await handleFlights(args);
        break;
      case 'attractions':
        await handleAttractions(args);
        break;
      case 'costs':
        await handleCosts(args);
        break;
      case 'safety':
        await handleSafety(args);
        break;
      case 'info':
        handleInfo();
        break;
      case 'tools':
        handleTools();
        break;
      case 'help':
        displayMenu();
        break;
      case 'exit':
        console.log('\n👋 Goodbye!\n');
        rl.close();
        process.exit(0);
      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log('Type "help" for available commands');
    }
  }
}

// Start
runCLI().catch((error) => {
  logger.error('CLI crashed', error);
  process.exit(1);
});
