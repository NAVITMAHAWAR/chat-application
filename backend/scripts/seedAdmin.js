import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../model/userModel.js";

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = process.env.ADMIN_EMAIL || "admin@chatapp.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  let user = await User.findOne({ email });
  if (user) {
    user.role = "admin";
    await user.save();
    console.log("Updated existing user to admin:", email);
  } else {
    const hash = await bcrypt.hash(password, 10);
    await User.create({ name: "Super Admin", email, password: hash, role: "admin" });
    console.log("Admin created:", email, password);
  }
  process.exit(0);
};
seed();