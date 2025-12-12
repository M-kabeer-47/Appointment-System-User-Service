import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt.js";
import { AuthenticatedRequest } from "../types/index.js";

// Middleware to verify access token from cookies
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check Authorization header first, then cookies as fallback
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({ error: "Access token required" });
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired access token" });
  }
};

// Middleware to check user roles
export const authorize = (...allowedRoles: Role[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
};
