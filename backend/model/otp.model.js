import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    name: String,
    password: String, // hashed password store temporarily
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL – auto delete after expiresAt
    },
  },
  { timestamps: true }
);

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;