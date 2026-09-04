import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWeatherTool } from '../tools/weather/weather.tool';
import { createFlightsPriceTool } from '../tools/flights/flights.tool';
import { createAttractionsToolTool } from '../tools/attractions/attractions.tool';
import { createCostOfLivingTool } from '../tools/costOfLiving/costOfLiving.tool';
import { createSafetyTool } from '../tools/safety/safety.tool';
import { Logger } from '../services/logger.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const logger = new Logger('API-Server');

// Initialize tools
const weatherTool = createWeatherTool();
const flightsTool = createFlightsPriceTool();
const attractionsTool = createAttractionsToolTool();
const costsTool = createCostOfLivingTool();
const safetyTool = createSafetyTool();

/**
 * SIMPLE HTTP SERVER
 *
 * No Express, no dependencies
 * Pure Node.js
 */

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API: Weather
  if (req.url === '/api/weather' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      const { city } = JSON.parse(body);
      logger.info(`API: Weather request for ${city}`);
      const result = await weatherTool.execute({ city });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(result);
    });
    return;
  }

  // API: Flights
  if (req.url === '/api/flights' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      const { origin, destination, departureDate } = JSON.parse(body);
      logger.info(`API: Flights request ${origin}→${destination}`);
      const result = await flightsTool.execute({
        origin,
        destination,
        departureDate,
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(result);
    });
    return;
  }

  // API: Attractions
  if (req.url === '/api/attractions' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      const { city } = JSON.parse(body);
      logger.info(`API: Attractions request for ${city}`);
      const result = await attractionsTool.execute({ city });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(result);
    });
    return;
  }

  // API: Costs
  if (req.url === '/api/costs' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      const { city } = JSON.parse(body);
      logger.info(`API: Costs request for ${city}`);
      const result = await costsTool.execute({ city });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(result);
    });
    return;
  }

  // API: Safety
  if (req.url === '/api/safety' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      const { city } = JSON.parse(body);
      logger.info(`API: Safety request for ${city}`);
      const result = await safetyTool.execute({ city });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(result);
    });
    return;
  }

  // Serve static files
  const requestUrl = req.url || '/';
  let filePath = path.join(
    __dirname,
    '../ui/dashboard',
    requestUrl === '/' ? 'index.html' : requestUrl
  );

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath);
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
    };

    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  TRAVEL AGENT - UI SERVER                      ║
╚════════════════════════════════════════════════════════════════╝

🚀 Server: http://localhost:${PORT}
📊 Dashboard: http://localhost:${PORT}

✨ No Express, pure Node.js HTTP
  `);
  logger.info(`Server started on port ${PORT}`);
});
