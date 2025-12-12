import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Protected routes
router.get("/me", authenticate, authController.me);
router.get("/doctors", authenticate, authController.getDoctors);
router.patch("/profile", authenticate, authController.updateProfile);

export default router;
