import { Router } from "express";
import {
  getUserProfile,
  login,
  LogOut,
  signUp,
} from "../controllers/userController.js";
import { secureRoute } from "../middleware/secureRoute.js";
const router = Router();

router.post("/register", signUp);
router.post("/login", login);
router.post("/LogOut", LogOut);
router.get("/getUserProfile", secureRoute, getUserProfile);

export default router;
