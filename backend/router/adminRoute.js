import { Router } from "express";
import { secureRoute } from "../middleware/secureRoute.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleBlockUser,
  changeUserRole,
  getStats,
  getActivity,
  getAnalytics,
} from "../controllers/adminController/adminController.js";

const router = Router();

router.use(secureRoute, isAdmin);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/block", toggleBlockUser);
router.patch("/users/:id/role", changeUserRole);
router.get("/stats", getStats);
router.get("/activity", getActivity);
router.get("/analytics", getAnalytics);

export default router;