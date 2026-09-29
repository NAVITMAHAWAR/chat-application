import mongoose from "mongoose";
import User from "./userModel.js"

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
      required: true,
      maxLength: 1000,
      trim: true,
      validate: [
        {
          validator: (value) => value.length > 0,
          message: "cannot be empty",
        },
      ],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

export const Message = mongoose.model("Message", messageSchema);
export default Message;
