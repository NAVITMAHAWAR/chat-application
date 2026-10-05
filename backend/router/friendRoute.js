import { Router } from "express";
import { secureRoute } from "../middleware/secureRoute.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getFriends,
  getIncomingRequests,
  getOutgoingRequests,
  searchUsers,
  unfriend,
} from "../controllers/friendController.js";

const router = Router();

router.use(secureRoute);

router.post("/request", sendFriendRequest);
router.patch("/request/:requestId/accept", acceptFriendRequest);
router.patch("/request/:requestId/reject", rejectFriendRequest);
router.delete("/request/:requestId", cancelFriendRequest);
router.get("/friends", getFriends);
router.get("/requests/incoming", getIncomingRequests);
router.get("/requests/outgoing", getOutgoingRequests);
router.get("/search", searchUsers);
router.delete("/friends/:friendId", unfriend);

export default router;
