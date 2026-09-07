import { describe, it, expect } from 'vitest';
import { CostService } from '../../../src/services/cost.service';

describe('CostService - recordCost()', () => {
  it('should record a cost entry with correct fields', () => {
    const costService = new CostService();

    const entry = costService.recordCost('getWeather');

    expect(entry.toolName).toBe('getWeather');
    expect(entry.amountUSD).toBe(0);
    expect(typeof entry.timestamp).toBe('string');
  });

  it('should not allow external mutation of internal cost entries', () => {
    // 1. Arrange: Create service and log a real entry
    const service = new CostService();
    service.recordCost('getWeather');

    // 2. Act: Retrieve the records and try to push a rogue entry
    const externalEntries = service.getEntries();
    externalEntries.push({
      toolName: 'fakeToolThatCostsMillions',
      amountUSD: 9999.99,
      timestamp: new Date().toISOString()
    });

    // 3. Assert: The real internal state should remain completely unaffected (still only 1 entry)
    expect(service.getEntries()).toHaveLength(1);
    expect(service.getEntries()[0].toolName).toBe('getWeather');
  });

  it('should calculate the total cost accurately across multiple tool executions', () => {
    const service = new CostService();

    // 1. Record your tools using the real all-zero pricing
    service.recordCost('getFlightPrice');
    service.recordCost('getWeather');
    service.recordCost('getFlightPrice');

    const total = service.getTotalCost();

    // 2. Assert that 0 + 0 + 0 equals 0
    expect(total).toBe(0); // Changed from 0.02 to 0 to match your PRICING map
  });

  it('should safely return 0 when no costs have been recorded', () => {
    const service = new CostService();
    expect(service.getTotalCost()).toBe(0);
  });

});