import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { RegisterBody, LoginBody, UserResponse } from "../types/index.js";

const SALT_ROUNDS = 10;

// Transform user to response (exclude password)
const toUserResponse = (user: {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: Role;
  createdAt: Date;
}): UserResponse => ({
  id: user.id,
  email: user.email,
  name: user.name,
  image: user.image,
  role: user.role,
  createdAt: user.createdAt,
});

export const authService = {
  // Register a new user
  async register(data: RegisterBody) {
    const { email, password, name, role } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || Role.PATIENT,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ userId: user.id });

    return {
      user: toUserResponse(user),
      accessToken,
      refreshToken,
    };
  },

  // Login user
  async login(data: LoginBody) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ userId: user.id });

    return {
      user: toUserResponse(user),
      accessToken,
      refreshToken,
    };
  },

  // Refresh tokens
  async refreshTokens(refreshToken: string) {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    return {
      user: toUserResponse(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  // Get user by ID
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    return toUserResponse(user);
  },

  // Get all doctors
  async getDoctors() {
    const doctors = await prisma.user.findMany({
      where: { role: Role.DOCTOR },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });
    return doctors;
  },

  // Update user profile
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      currentPassword?: string;
      newPassword?: string;
      image?: string;
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const updateData: { name?: string; password?: string; image?: string } = {};

    // Update name if provided
    if (data.name && data.name !== user.name) {
      updateData.name = data.name;
    }

    // Update password if both current and new provided
    if (data.currentPassword && data.newPassword) {
      const isValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isValid) {
        throw new Error("Current password is incorrect");
      }
      updateData.password = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
    }

    // Update image if provided
    if (data.image !== undefined) {
      updateData.image = data.image;
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return toUserResponse(user);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return toUserResponse(updatedUser);
  },
};
