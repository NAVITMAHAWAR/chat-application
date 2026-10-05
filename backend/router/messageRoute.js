import { Router } from "express";
import {
  createGroup,
  getGroupMessages,
  getGroups,
  getMessage,
  getUnreadCounts,
  sendGroupMessage,
  sendMessage,
  sendMediaMessage,
  sendGroupMediaMessage,
} from "../controllers/message.controller.js";
import { secureRoute } from "../middleware/secureRoute.js";
import { upload } from "../middleware/upload.js";

const messageRouter = Router();

messageRouter.post("/send/:id", secureRoute, sendMessage);
messageRouter.get("/get/:id", secureRoute, getMessage);
messageRouter.get("/unread-counts", secureRoute, getUnreadCounts);

// Media (image / file)
messageRouter.post(
  "/send-media/:id",
  secureRoute,
  upload.single("file"),
  sendMediaMessage,
);
messageRouter.post(
  "/groups/:id/send-media",
  secureRoute,
  upload.single("file"),
  sendGroupMediaMessage,
);

messageRouter.post("/groups", secureRoute, createGroup);
messageRouter.get("/groups", secureRoute, getGroups);
messageRouter.post("/groups/:id/send", secureRoute, sendGroupMessage);
messageRouter.get("/groups/:id/messages", secureRoute, getGroupMessages);

export default messageRouter;
