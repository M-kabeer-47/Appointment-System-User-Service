import { Role } from "@prisma/client";
import { Request } from "express";

// JWT Payload types
export interface AccessTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export interface RefreshTokenPayload {
  userId: string;
}

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

// API Request/Response types
export interface RegisterBody {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface LoginBody {
  email: string;
  password: string;
}

// User response (without password)
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: Role;
  createdAt: Date;
}
