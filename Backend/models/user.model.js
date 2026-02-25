import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: false // Optional for Google sign-in users
    },

    mobile: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["user", "owner", "deliveryBoy"],
      default: "user"
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true // Allows null values while maintaining uniqueness
    },

    photoURL: {
      type: String
    },

    resetOtp: {
  type: String
},

isOtpVerified: {
  type: Boolean,
  default: false
},

otpExpires: {
  type: Date
}
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;