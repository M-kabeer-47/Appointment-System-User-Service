import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { AccessTokenPayload, RefreshTokenPayload } from "../types/index.js";

// Generate access token (short-lived: 15 minutes)
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, config.jwt.accessTokenSecret, {
    expiresIn: config.jwt.accessTokenExpiry,
  });
};

// Generate refresh token (long-lived: 7 days)
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshTokenSecret, {
    expiresIn: config.jwt.refreshTokenExpiry,
  });
};

// Verify access token
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, config.jwt.accessTokenSecret) as AccessTokenPayload;
};

// Verify refresh token
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(
    token,
    config.jwt.refreshTokenSecret
  ) as RefreshTokenPayload;
};
