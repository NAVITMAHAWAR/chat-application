import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Configure this based on your client URL in production
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
    console.log("Connected users:", [...users.values()]);
  }
  io.emit("getOnline", [...new Set(users.values())]);

  socket.on("disconnect", () => {
    console.log("Client Disconnected", socket.id);
    users.delete(socket.id);
    io.emit("getOnline", [...new Set(users.values())]);
  });
});

export { server, io, app };
