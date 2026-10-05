import express from "express";
import { Server } from "socket.io";
import http from "http";
import User from "../model/userModel.js";
import Message from "../model/message.model.js";

const app = express();
const server = http.createServer(app);
const configuredOrigins = process.env.CLIENT_ORIGINS
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: configuredOrigins?.length ? configuredOrigins : "*",
    methods: ["GET", "POST"],
  },
});

export const getReceiverSocketId = (receiverId) => {
  for (const [socketId, userId] of users.entries()) {
    if (String(userId) === String(receiverId)) return socketId;
  }
  return undefined;
};

export const getReceiverSocketIds = (receiverIds) => {
  const ids = new Set(receiverIds.map((id) => String(id)));
  return [...users.entries()]
    .filter(([, userId]) => ids.has(String(userId)))
    .map(([socketId]) => socketId);
};

const users = new Map();

io.on("connection", (socket) => {
  console.log("New Client Connected: ", socket.id);

  const rawUserId = socket.handshake.query.userId;
  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

  if (userId) {
    users.set(socket.id, userId);
    const lastLogin = new Date();
    User.findByIdAndUpdate(userId, { isOnline: true, lastLogin }).catch(console.log);
    io.emit("getOnline", [...new Set(users.values())]);
    io.emit("userStatusChanged", { userId, isOnline: true, lastLogin });
  }

  // ───────── TYPING ─────────
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketIds = getReceiverSocketIds([receiverId]);
    receiverSocketIds.forEach((receiverSocketId) => {
      io.to(receiverSocketId).emit("typing", {
        senderId: userId,
        conversationId: userId,
      });
    });
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketIds = getReceiverSocketIds([receiverId]);
    receiverSocketIds.forEach((receiverSocketId) => {
      io.to(receiverSocketId).emit("stopTyping", {
        senderId: userId,
        conversationId: userId,
      });
    });
  });

  // Group typing
  socket.on("typingGroup", ({ groupId, participantIds }) => {
    const socketIds = getReceiverSocketIds(
      (participantIds || []).filter((id) => String(id) !== String(userId)),
    );
    socketIds.forEach((sid) =>
      io.to(sid).emit("typing", {
        senderId: userId,
        conversationId: groupId,
      }),
    );
  });

  socket.on("stopTypingGroup", ({ groupId, participantIds }) => {
    const socketIds = getReceiverSocketIds(
      (participantIds || []).filter((id) => String(id) !== String(userId)),
    );
    socketIds.forEach((sid) =>
      io.to(sid).emit("stopTyping", {
        senderId: userId,
        conversationId: groupId,
      }),
    );
  });

  // ───────── MESSAGE DELIVERED ─────────
  socket.on("messageDelivered", async ({ messageId, senderId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { status: "delivered" });
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageId,
          status: "delivered",
        });
      }
    } catch (err) {
      console.log("messageDelivered error:", err.message);
    }
  });

  // ───────── MESSAGE READ ─────────
  socket.on("messageRead", async ({ messageIds, senderId, conversationId }) => {
    try {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;

      await Message.updateMany(
        { _id: { $in: messageIds } },
        { status: "read", $addToSet: { readBy: userId } },
      );

      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageIds,
          status: "read",
          conversationId,
        });
      }
    } catch (err) {
      console.log("messageRead error:", err.message);
    }
  });

  // ───────── DISCONNECT ─────────
  socket.on("disconnect", () => {
    console.log("Client Disconnected", socket.id);
    const uid = users.get(socket.id);
    users.delete(socket.id);

    if (uid) {
      const stillOnline = [...users.values()].some(
        (id) => String(id) === String(uid),
      );
      if (!stillOnline) {
        const lastLogout = new Date();
        User.findByIdAndUpdate(uid, {
          isOnline: false,
          lastLogout,
        }).catch(console.log);
        io.emit("userStatusChanged", { userId: uid, isOnline: false, lastLogout });
      }
    }
    io.emit("getOnline", [...new Set(users.values())]);
  });
});

export { server, io, app };
