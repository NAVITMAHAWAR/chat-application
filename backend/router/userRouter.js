import { Router } from "express";
import {
  getMyProfile,
  getUserProfile,
  login,
  LogOut,
  resendRegisterOtp,
  sendRegisterOtp,
  signUp,
  updateAvatar,
  updateProfile,
  verifyRegisterOtp,
} from "../controllers/userController.js";
import { secureRoute } from "../middleware/secureRoute.js";
import { upload } from "../middleware/upload.js";
const router = Router();

router.post("/send-otp", sendRegisterOtp);
router.post("/verify-otp", verifyRegisterOtp);
router.post("/resend-otp", resendRegisterOtp);

// router.post("/register", signUp);
router.post("/login", login);
router.post("/LogOut", LogOut);

// Profile
router.get("/me", secureRoute, getMyProfile);
router.put("/profile", secureRoute, updateProfile);
router.put(
  "/profile/avatar",
  secureRoute,
  upload.single("avatar"),
  updateAvatar,
);

router.get("/getUserProfile", secureRoute, getUserProfile);

export default router;
