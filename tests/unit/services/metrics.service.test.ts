import { describe, it, expect } from 'vitest';
import { MetricsService } from '../../../src/services/metrics.service';

describe('Metric Service - record()', () => {
    it('should record a metric entry with correct fields', () => {
        const metricsService = new MetricsService();

        const entry = metricsService.record('getWeather', 150, true);

        expect(entry.toolName).toBe('getWeather');
        expect(entry.durationMs).toBe(150);
        expect(entry.success).toBe(true);
        expect(typeof entry.timestamp).toBe('string');
    });

    it('should not allow external mutation of internal entries', () => {
        const metricsService = new MetricsService();
        metricsService.record('getWeather', 150, true);

        const entries = metricsService.getEntries();
        entries.push({ toolName: 'fake', durationMs: 999, success: true, timestamp: '' });

        // Internal state should still only have 1 real entry
        expect(metricsService.getEntries()).toHaveLength(1);
    });

    it('should not allow external mutation of internal entries', () => {
        const metricsService = new MetricsService();
        metricsService.record('getWeather', 150, true);
        const rate = metricsService.getSuccessRate('getWeather',);
        const entries = metricsService.getEntries();
        entries.push({ toolName: 'fake', durationMs: 999, success: true, timestamp: '' });

        // Internal state should still only have 1 real entry
        expect(metricsService.getEntries()).toHaveLength(1);
        expect(metricsService.getEntries()[0].toolName).toBe('getWeather');
    });
    it('should calculate success rate correctly', () => {
        const metricsService = new MetricsService();

        metricsService.record('getWeather', 100, true);
        metricsService.record('getWeather', 100, true);
        metricsService.record('getWeather', 100, false);
        metricsService.record('getWeather', 100, true);

        const rate = metricsService.getSuccessRate('getWeather');

        expect(rate).toBe(75);
    });

    it('should return 0 success rate when no entries exist for a tool', () => {
        const metricsService = new MetricsService();

        const rate = metricsService.getSuccessRate('getWeather');

        expect(rate).toBe(null);
    });

    it('should calculate average duration correctly', () => {
        const metricsService = new MetricsService();

        // Record the example entries: 100ms, 200ms, 300ms, 400ms
        metricsService.record('getWeather', 100, true);
        metricsService.record('getWeather', 200, true);
        metricsService.record('getWeather', 300, true);
        metricsService.record('getWeather', 400, true);

        const average = metricsService.getAverageDuration('getWeather');

        // Total 1000ms / 4 items = 250ms
        expect(average).toBe(250);
    });

    it('should return null when there is no data for that tool', () => {
        const metricsService = new MetricsService();

        // Do not record anything for 'getWeather'
        const average = metricsService.getAverageDuration('getWeather');

        // Should explicitly return null, not 0
        expect(average).toBeNull();
    });

     it('should calculate p50 and p95 using real observed values from a 10-item dataset', () => {
    const metricsService = new MetricsService();

    // Record the 10 hand-calculated durations (10ms to 100ms)
    metricsService.record('getWeather', 10, true);
    metricsService.record('getWeather', 20, true);
    metricsService.record('getWeather', 30, true);
    metricsService.record('getWeather', 40, true);
    metricsService.record('getWeather', 50, true);
    metricsService.record('getWeather', 60, true);
    metricsService.record('getWeather', 70, true);
    metricsService.record('getWeather', 80, true);
    metricsService.record('getWeather', 90, true);
    metricsService.record('getWeather', 100, true);

    const percentiles = metricsService.getLatencyPercentiles('getWeather');

    // Assert that the returned object matches our expected real data points
    expect(percentiles).not.toBeNull();
    expect(percentiles?.p50).toBe(50);   // Picks the 5th value (50ms) instead of averaging to 55ms
    expect(percentiles?.p95).toBe(100);  // Picks the 10th value (100ms)
  });

  it('should return null when running percentiles on an empty dataset', () => {
    const metricsService = new MetricsService();
    const percentiles = metricsService.getLatencyPercentiles('getWeather');
    
    expect(percentiles).toBeNull();
  });
  
});