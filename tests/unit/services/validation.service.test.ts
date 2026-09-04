import { describe, it, expect } from 'vitest';
import { ValidationService } from '../../../src/services/validation.service';

describe('ValidationService', () => {
  // City validation
  describe('validateCity', () => {
    it('should accept valid city', () => {
      const result = ValidationService.validateCity('Paris');
      expect(result.valid).toBe(true);
    });

    it('should reject empty city', () => {
      const result = ValidationService.validateCity('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject city with numbers', () => {
      const result = ValidationService.validateCity('Paris123');
      expect(result.valid).toBe(false);
    });

    it('should accept city with apostrophe', () => {
      const result = ValidationService.validateCity("Saint-Jean");
      expect(result.valid).toBe(true);
    });
  });

  // Airport code validation
  describe('validateAirportCode', () => {
    it('should accept valid 3-letter code', () => {
      const result = ValidationService.validateAirportCode('CDG');
      expect(result.valid).toBe(true);
    });

    it('should accept valid 2-letter code', () => {
      const result = ValidationService.validateAirportCode('JFK');
      expect(result.valid).toBe(true);
    });

    it('should reject empty code', () => {
      const result = ValidationService.validateAirportCode('');
      expect(result.valid).toBe(false);
    });

    it('should reject code with numbers', () => {
      const result = ValidationService.validateAirportCode('CD1');
      expect(result.valid).toBe(false);
    });

    it('should accept lowercase', () => {
      const result = ValidationService.validateAirportCode('cdg');
      expect(result.valid).toBe(true);
    });
  });

  // Date validation
  describe('validateDate', () => {
    it('should accept valid future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const dateStr = futureDate.toISOString().split('T')[0];
      
      const result = ValidationService.validateDate(dateStr);
      expect(result.valid).toBe(true);
    });

    it('should reject past date', () => {
      const result = ValidationService.validateDate('2020-01-01');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('past');
    });

    it('should reject wrong format', () => {
      const result = ValidationService.validateDate('01-01-2026');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('YYYY-MM-DD');
    });

    it('should reject empty date', () => {
      const result = ValidationService.validateDate('');
      expect(result.valid).toBe(false);
    });
  });

  // Route validation
  describe('validateRoute', () => {
    it('should accept valid route', () => {
      const result = ValidationService.validateRoute('JFK', 'CDG');
      expect(result.valid).toBe(true);
    });

    it('should reject same origin and destination', () => {
      const result = ValidationService.validateRoute('JFK', 'JFK');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('same');
    });

    it('should reject invalid origin', () => {
      const result = ValidationService.validateRoute('123', 'CDG');
      expect(result.valid).toBe(false);
    });

    it('should reject invalid destination', () => {
      const result = ValidationService.validateRoute('JFK', '');
      expect(result.valid).toBe(false);
    });
  });
});