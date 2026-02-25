import express from "express";
import {
  resetPassword,
  sendOtp,
  signIn,
  signOut,
  signUp,
  verifyOtp,
  googleSignUp,
  googleSignIn,
  getCurrentUser
} from "../controllers/auth.controllers.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.get("/signout", signOut);

authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);

authRouter.post("/google-signup", googleSignUp);
authRouter.post("/google-signin", googleSignIn);

// Get current user (protected route)
authRouter.get("/me", verifyToken, getCurrentUser);

export default authRouter;