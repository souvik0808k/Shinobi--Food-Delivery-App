import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", // use lowercase
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// Send OTP Mail Function
export const sendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Shinobi 🥷" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 10px;">
          <h2>Password Reset Request</h2>
          <p>Your OTP for password reset is:</p>
          <h1 style="color: #ff4d2d;">${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
          <br/>
          <p>If you didn’t request this, please ignore this email.</p>
        </div>
      `
    });

    console.log("✅ OTP email sent successfully");
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};