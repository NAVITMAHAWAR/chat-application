import mongoose from "mongoose";
import User from "./userModel.js";

const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversations",
      index: true,
    },
    message: {
      type: String,
      required: function () {
        return this.messageType === "text";
      },
      maxLength: 1000,
      trim: true,
      validate: [
        {
          validator: function (value) {
            return this.messageType !== "text" || Boolean(value?.trim());
          },
          message: "cannot be empty",
        },
      ],
    },
    // ── Media fields ──
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

export const Message = mongoose.model("Message", messageSchema);
export default Message;
