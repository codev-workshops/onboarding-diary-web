import { generateAccessToken, generateRefreshToken, hashToken, verifyAccessToken } from '../../utils/jwt';

describe('JWT Utils', () => {
  const payload = { userId: 'user-1', email: 'test@example.com', role: 'recruit' as const };

  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateAccessToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw for an invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });

    it('should throw for a tampered token', () => {
      const token = generateAccessToken(payload);
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyAccessToken(tampered)).toThrow();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a random hex string', () => {
      const token = generateRefreshToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(80); // 40 bytes = 80 hex chars
    });

    it('should generate unique tokens each time', () => {
      const token1 = generateRefreshToken();
      const token2 = generateRefreshToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('hashToken', () => {
    it('should hash a token consistently', () => {
      const token = 'test-token';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different tokens', () => {
      const hash1 = hashToken('token1');
      const hash2 = hashToken('token2');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce a 64-character hex string (SHA-256)', () => {
      const hash = hashToken('test');
      expect(hash.length).toBe(64);
    });
  });
});
