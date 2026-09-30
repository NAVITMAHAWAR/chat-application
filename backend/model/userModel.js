import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isOnline: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    lastLogin: { type: Date },
    lastLogout: { type: Date },
    loginCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
export default User;