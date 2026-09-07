interface MetricEntry {
  toolName: string; // eg:hetWeather
  durationMs: number; // eg: 100
  success: boolean; // eg: true
  timestamp: string; // eg: 2026-09-06T19:32:00Z
}

class MetricsService {
  private metrics: MetricEntry[] = [];
  record(toolName: string, durationMs: number, success: boolean): MetricEntry {
    const entry: MetricEntry = {
      toolName,
      durationMs,
      success,
      timestamp: new Date().toISOString(),
    };
    this.metrics.push(entry);

    return entry;
  }

  getEntries(): MetricEntry[] {
    return [...this.metrics];
  }

  getSuccessRate(toolName: string): number | null {
    const entries = this.metrics.filter((entry) => entry.toolName === toolName);
    if (entries.length === 0) {
      return null;
    }
    const successCount = entries.filter((entry) => entry.success).length;
    return (successCount / entries.length) * 100;
  }
  getAverageDuration(toolName: string): number | null {
    const entries = this.metrics.filter((entry) => entry.toolName === toolName);
    if (entries.length === 0) {
      return null;
    }
    const totalDuration = entries.reduce((sum, entry) => sum + entry.durationMs, 0);
    return totalDuration / entries.length;
  }

  /**
   * Completely clear out all recorded performance metrics logs.
   * Crucial for resetting state between isolated unit tests.
   */
  reset(): void {
    this.metrics = [];
  }

  private getPercentile(sortedValues: number[], percentile: number): number {
    // Step 1: Guard against an empty array to prevent accessing invalid index [-1]
    if (sortedValues.length === 0) {
      return 0;
    }

    // Step 2: Convert the percentile to a decimal and multiply by the total count
    // Example for p95 with 10 items: (95 / 100) * 10 = 9.5
    const calculatedIndex = (percentile / 100) * sortedValues.length;

    // Step 3: Round up to the next whole number to get the human position (9.5 -> 10)
    const humanPosition = Math.ceil(calculatedIndex);

    // Step 4: Convert to a 0-based JavaScript array index (10 - 1 = 9)
    const arrayIndex = humanPosition - 1;

    // Step 5: Return the real, observed value stored at that index
    return sortedValues[arrayIndex];
  }

  getLatencyPercentiles(toolName: string): { p50: number; p95: number; p99: number } | null {
    // 1. Filter entries for this tool, extract just the durations, and sort ascending
    const sortedDurations = this.metrics
      .filter((entry) => entry.toolName === toolName)
      .map((entry) => entry.durationMs)
      .sort((a, b) => a - b);

    // 2. Guard: If there is no data for this tool, return null (not false metrics like 0)
    if (sortedDurations.length === 0) {
      return null;
    }

    // 3. Call getPercentile() three times using the single, pre-sorted array
    const p50 = this.getPercentile(sortedDurations, 50);
    const p95 = this.getPercentile(sortedDurations, 95);
    const p99 = this.getPercentile(sortedDurations, 99);

    // 4. Return the formatted object
    return { p50, p95, p99 };
  }

  getOverallSummary(): {
    totalCalls: number;
    overallSuccessRate: number | null;
    overallAvgDuration: number | null;
  } {
    const totalCalls = this.metrics.length;

    if (totalCalls === 0) {
      return {
        totalCalls: 0,
        overallSuccessRate: null,
        overallAvgDuration: null,
      };
    }

    const totalSuccesses = this.metrics.filter((entry) => entry.success).length;
    const overallSuccessRate = (totalSuccesses / totalCalls) * 100;

    const totalDuration = this.metrics.reduce((sum, entry) => sum + entry.durationMs, 0);
    const overallAvgDuration = totalDuration / totalCalls;

    return {
      totalCalls,
      overallSuccessRate,
      overallAvgDuration,
    };
  }
}

export const metricsService = new MetricsService();
export { MetricsService };
