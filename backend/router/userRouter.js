import { Router } from "express";
import {
  getUserProfile,
  login,
  LogOut,
  resendRegisterOtp,
  sendRegisterOtp,
  signUp,
  verifyRegisterOtp,
} from "../controllers/userController.js";
import { secureRoute } from "../middleware/secureRoute.js";
const router = Router();



router.post("/send-otp", sendRegisterOtp);
router.post("/verify-otp", verifyRegisterOtp);
router.post("/resend-otp", resendRegisterOtp);

// router.post("/register", signUp);
router.post("/login", login);
router.post("/LogOut", LogOut);
router.get("/getUserProfile", secureRoute, getUserProfile);



export default router;
