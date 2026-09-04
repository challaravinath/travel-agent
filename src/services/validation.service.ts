/**
 * VALIDATION SERVICE
 *
 * Centralized input validation (Guardrails)
 * Apply across all tools and CLI
 *
 * Pattern:
 * 1. Validate input
 * 2. Return { valid, error? }
 * 3. If invalid, return error to user
 * 4. If valid, proceed
 */

export class ValidationService {
  /**
   * Validate city name
   *
   * Rules:
   * - Not empty
   * - Max 100 chars
   * - Only letters, spaces, hyphens, apostrophes
   */
  static validateCity(city: string): { valid: boolean; error?: string } {
    if (!city || city.trim().length === 0) {
      return { valid: false, error: 'City name cannot be empty' };
    }
    if (city.length > 100) {
      return { valid: false, error: 'City name too long (max 100 chars)' };
    }
    if (!/^[a-zA-Z\s'-]+$/.test(city)) {
      return {
        valid: false,
        error: 'City name can only contain letters, spaces, hyphens, apostrophes',
      };
    }
    return { valid: true };
  }

  /**
   * Validate airport code
   *
   * Rules:
   * - Not empty
   * - 2-3 characters
   * - Only letters
   */
  static validateAirportCode(code: string): { valid: boolean; error?: string } {
    if (!code || code.trim().length === 0) {
      return { valid: false, error: 'Airport code cannot be empty' };
    }
    const trimmed = code.trim();
    if (trimmed.length < 2 || trimmed.length > 3) {
      return { valid: false, error: 'Airport code must be 2-3 characters' };
    }
    if (!/^[A-Z]+$/i.test(trimmed)) {
      return { valid: false, error: 'Airport code must contain only letters' };
    }
    return { valid: true };
  }

  /**
   * Validate date
   *
   * Rules:
   * - Not empty
   * - Format: YYYY-MM-DD
   * - Must be in future
   */
  static validateDate(dateStr: string): { valid: boolean; error?: string } {
    if (!dateStr || dateStr.trim().length === 0) {
      return { valid: false, error: 'Date cannot be empty' };
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
    }

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return { valid: false, error: 'Invalid date' };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today) {
        return { valid: false, error: 'Date cannot be in the past' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'Date parsing failed' };
    }
  }

  /**
   * Validate route
   *
   * Rules:
   * - Both codes valid
   * - Origin ≠ Destination
   */
  static validateRoute(origin: string, destination: string): { valid: boolean; error?: string } {
    const originValidation = this.validateAirportCode(origin);
    if (!originValidation.valid) {
      return { valid: false, error: `Origin: ${originValidation.error}` };
    }

    const destValidation = this.validateAirportCode(destination);
    if (!destValidation.valid) {
      return { valid: false, error: `Destination: ${destValidation.error}` };
    }

    if (origin.toUpperCase() === destination.toUpperCase()) {
      return { valid: false, error: 'Origin and destination cannot be the same' };
    }

    return { valid: true };
  }
}
