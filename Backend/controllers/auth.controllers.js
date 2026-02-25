import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";


// ==========================
// 🥷 SIGN UP
// ==========================
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });
    }

    // Validate mobile
    if (!mobile || mobile.length < 10) {
      return res.status(400).json({
        message: "Mobile number must be at least 10 digits."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      email,
      mobile,
      role,
      password: hashedPassword
    });

    // Generate token
    const token = genToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // change to true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: `Signup error: ${error.message}`
    });
  }
};



// ==========================
// 🔐 SIGN IN
// ==========================
export const signIn = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    // Check user by email or mobile
    const user = await User.findOne({
      $or: [
        { email: emailOrMobile },
        { mobile: emailOrMobile }
      ]
    });
    
    if (!user) {
      return res.status(400).json({
        message: "User does not exist."
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password."
      });
    }

    // Generate token
    const token = genToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: `Sign in error: ${error.message}`
    });
  }
};



// ==========================
// 🚪 SIGN OUT
// ==========================
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");

    return res.status(200).json({
      message: "Logged out successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: `Sign out error: ${error.message}`
    });
  }
};

// ==========================
// 📩 SEND OTP
// ==========================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.isOtpVerified = false;

    await user.save();

    await sendOtpMail(email, otp);

    return res.status(200).json({
      message: "OTP sent successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: `Send OTP error: ${error.message}`
    });
  }
};


// ==========================
// 🔎 VERIFY OTP
// ==========================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      user.resetOtp !== otp ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: `Verify OTP error: ${error.message}`
    });
  }
};


// ==========================
// 🔑 RESET PASSWORD
// ==========================
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.isOtpVerified) {
      return res.status(400).json({
        message: "OTP verification required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.isOtpVerified = false;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: `Reset password error: ${error.message}`
    });
  }
};


// ==========================
// 🌐 GOOGLE SIGN UP
// ==========================
export const googleSignUp = async (req, res) => {
  try {
    const { fullName, email, mobile, password, role, googleId, photoURL } = req.body;

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    // Validate mobile
    if (!mobile || mobile.length < 10) {
      return res.status(400).json({
        message: "Mobile number must be at least 10 digits."
      });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password && password.length > 0) {
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters."
        });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      mobile,
      role,
      password: hashedPassword,
      googleId,
      photoURL
    });

    // Generate token
    const token = genToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      message: "User registered successfully with Google",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: `Google signup error: ${error.message}`
    });
  }
};


// ==========================
// 🌐 GOOGLE SIGN IN
// ==========================
export const googleSignIn = async (req, res) => {
  try {
    const { email, googleId } = req.body;

    // Check if user exists
    const user = await User.findOne({ email, googleId });
    if (!user) {
      return res.status(404).json({
        message: "User not found. Please complete sign up."
      });
    }

    // Generate token
    const token = genToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: `Google sign-in error: ${error.message}`
    });
  }
};

// Get current user (verify session)
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    return res.status(200).json({
      message: "User authenticated",
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error getting current user: ${error.message}`
    });
  }
};