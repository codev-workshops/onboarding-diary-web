import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { JwtPayload } from '../types';

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  } as jwt.SignOptions);
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
}
