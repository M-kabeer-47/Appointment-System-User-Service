import { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { config } from "../config/index.js";
import {
  AuthenticatedRequest,
  RegisterBody,
  LoginBody,
} from "../types/index.js";

// Cookie options
const cookieOptions = {
  httpOnly: config.cookie.httpOnly,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
};

export const authController = {
  // POST /register
  async register(req: Request<{}, {}, RegisterBody>, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      // Basic validation
      if (!email || !password || !name) {
        return res
          .status(400)
          .json({ error: "Email, password, and name are required" });
      }

      const result = await authService.register({
        email,
        password,
        name,
        role,
      });

      // Set cookies
      res.cookie("accessToken", result.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie("refreshToken", result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(201).json({
        message: "User registered successfully",
        user: result.user,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      return res.status(400).json({ error: message });
    }
  },

  // POST /login
  async login(req: Request<{}, {}, LoginBody>, res: Response) {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const result = await authService.login({ email, password });

      // Set cookies
      res.cookie("accessToken", result.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie("refreshToken", result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({
        message: "Login successful",
        user: result.user,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      return res.status(401).json({ error: message });
    }
  },

  // POST /refresh
  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token required" });
      }

      const result = await authService.refreshTokens(refreshToken);

      // Set new cookies
      res.cookie("accessToken", result.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Tokens refreshed successfully",
        user: result.user,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Token refresh failed";
      return res.status(401).json({ error: message });
    }
  },

  // POST /logout
  async logout(_req: Request, res: Response) {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    return res.status(200).json({ message: "Logged out successfully" });
  },

  // GET /me (protected)
  async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await authService.getUserById(req.user.userId);
      return res.status(200).json({ user });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get user";
      return res.status(400).json({ error: message });
    }
  },

  // GET /doctors (protected)
  async getDoctors(_req: Request, res: Response) {
    try {
      const doctors = await authService.getDoctors();
      return res.status(200).json({ doctors });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get doctors";
      return res.status(400).json({ error: message });
    }
  },

  // PATCH /profile (protected)
  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { name, currentPassword, newPassword, image } = req.body;

      const user = await authService.updateProfile(req.user.userId, {
        name,
        currentPassword,
        newPassword,
        image,
      });

      return res.status(200).json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      return res.status(400).json({ error: message });
    }
  },
};
