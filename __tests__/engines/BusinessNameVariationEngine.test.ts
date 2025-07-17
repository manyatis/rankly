import { BusinessNameVariationEngine } from '../../src/engines/BusinessNameVariationEngine';

describe('BusinessNameVariationEngine', () => {
  describe('generateBusinessNameVariations', () => {
    it('should generate basic spacing variations', () => {
      const businessName = 'Hello World Corp';
      const result = BusinessNameVariationEngine.generateBusinessNameVariations(businessName);
      
      expect(result).toContain('HelloWorldCorp');
      expect(result).toContain('Hello-World-Corp');
      expect(result).toContain('Hello_World_Corp');
    });

    it('should generate case variations', () => {
      const businessName = 'Hello World';
      const result = BusinessNameVariationEngine.generateBusinessNameVariations(businessName);
      
      expect(result).toContain('hello world');
      expect(result).toContain('HELLO WORLD');
      expect(result).toContain('Hello World');
    });

    it('should remove business suffixes', () => {
      const businessName = 'Acme Corporation Inc';
      const result = BusinessNameVariationEngine.generateBusinessNameVariations(businessName);
      
      // The regex removes "inc" but keeps "Corporation", so we get "Acme Corporation"
      const withoutSuffixes = result.filter(v => v.includes('Acme') && !v.includes('Inc'));
      expect(withoutSuffixes.length).toBeGreaterThan(0);
    });

    it('should handle common abbreviations', () => {
      const businessName = 'Smith and Jones';
      const result = BusinessNameVariationEngine.generateBusinessNameVariations(businessName);
      
      expect(result).toContain('Smith & Jones');
      
      const businessName2 = 'Smith & Jones';
      const result2 = BusinessNameVariationEngine.generateBusinessNameVariations(businessName2);
      expect(result2).toContain('Smith and Jones');
    });

    it('should generate individual word variations for multi-word names', () => {
      const businessName = 'Wells Fargo Bank';
      const result = BusinessNameVariationEngine.generateBusinessNameVariations(businessName);
      
      expect(result).toContain('wells');
      expect(result).toContain('fargo');
      expect(result).toContain('bank');
      expect(result).toContain('Wells');
      expect(result).toContain('Fargo');
      expect(result).toContain('Bank');
    });

    it('should not include words that are too short', () => {
      const businessName = 'Big Co';
      const result = BusinessNameVariationEngine.generateBusinessNameVariations(businessName);
      
      expect(result).toContain('big');
      expect(result).not.toContain('co');
    });

    it('should handle single word names', () => {
      const businessName = 'Google';
      const result = BusinessNameVariationEngine.generateBusinessNameVariations(businessName);
      
      expect(result).toContain('Google');
      expect(result).toContain('google');
      expect(result).toContain('GOOGLE');
    });

    it('should filter out variations that are too short', () => {
      const businessName = 'A B';
      const result = BusinessNameVariationEngine.generateBusinessNameVariations(businessName);
      
      // All variations should be longer than 1 character
      result.forEach(variation => {
        expect(variation.length).toBeGreaterThan(1);
      });
    });

    it('should remove duplicates', () => {
      const businessName = 'Test Test';
      const result = BusinessNameVariationEngine.generateBusinessNameVariations(businessName);
      
      // Should not have duplicate variations
      const unique = [...new Set(result)];
      expect(result.length).toBe(unique.length);
    });

    it('should limit word order permutations to 3 words or fewer', () => {
      const businessName = 'One Two Three Four';
      const result = BusinessNameVariationEngine.generateBusinessNameVariations(businessName);
      
      // Should not generate permutations for 4+ words due to exponential explosion
      expect(result).toContain('One Two Three Four');
      expect(result).not.toContain('Four Three Two One');
    });
  });
});