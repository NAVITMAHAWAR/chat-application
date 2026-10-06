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
    // ── Profile fields ──
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 200,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
