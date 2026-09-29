import mongoose from "mongoose";
import User from "./userModel.js";
import Message from "./message.model.js";

const conversationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
      },
    ],
    message: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Message,
        default: [],
      },
    ],
  },
  { timestamps: true },
);

export const Conversations = mongoose.model(
  "Conversations",
  conversationSchema,
);

export default Conversations;
