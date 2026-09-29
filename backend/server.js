import "dotenv/config";
import express from "express";
import connectDB from "./db/db.js";
import userRoute from "./router/userRouter.js";
import messageRouter from "./router/messageRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { app, server } from "./socket/server.js";

connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use("/user", userRoute);
app.use("/api/message", messageRouter);

app.get("/", (req, res) => {
  res.send("welcome to the server");
});
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
