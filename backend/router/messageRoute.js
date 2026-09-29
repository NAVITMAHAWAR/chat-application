import { Router } from "express";
import {
	createGroup,
	getGroupMessages,
	getGroups,
	getMessage,
	sendGroupMessage,
	sendMessage,
} from "../controllers/message.controller.js";
import { secureRoute } from "../middleware/secureRoute.js";

const messageRouter = Router();

messageRouter.post("/send/:id", secureRoute, sendMessage);
messageRouter.get("/get/:id", secureRoute, getMessage);
messageRouter.post("/groups", secureRoute, createGroup);
messageRouter.get("/groups", secureRoute, getGroups);
messageRouter.post("/groups/:id/send", secureRoute, sendGroupMessage);
messageRouter.get("/groups/:id/messages", secureRoute, getGroupMessages);

export default messageRouter;
