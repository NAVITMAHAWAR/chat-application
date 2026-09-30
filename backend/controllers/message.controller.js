import Conversations from "../model/conversation.model.js";
import Message from "../model/message.model.js";
import User from "../model/userModel.js";
import mongoose from "mongoose";
import {
  getReceiverSocketId,
  getReceiverSocketIds,
  io,
} from "../socket/server.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id; //current logged user id

    if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ message: "Invalid recipient" });
    }
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    if (!(await User.exists({ _id: receiverId }))) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    let conversation = await Conversations.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversations.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      conversationId: conversation._id,
      message,
    });

    conversation.message.push(newMessage._id);
    await conversation.save();

    const receiverSocketID = getReceiverSocketId(receiverId);

    if (receiverSocketID) {
      io.to(receiverSocketID).emit("newMessage", newMessage);

      // Mark as delivered immediately if receiver is online
      await Message.findByIdAndUpdate(newMessage._id, { status: "delivered" });
      newMessage.status = "delivered";

      // Tell sender that it was delivered
      const senderSocketID = getReceiverSocketId(senderId);
      if (senderSocketID) {
        io.to(senderSocketID).emit("messageStatusUpdate", {
          messageId: newMessage._id,
          status: "delivered",
        });
      }
    }

    res.status(201).json({
      message: "message Sent successfully",
      newMessage,
    });
  } catch (error) {
    console.log("Error from send message", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    const participantIds = [
      ...new Set([
        String(req.user._id),
        ...(Array.isArray(memberIds) ? memberIds.map(String) : []),
      ]),
    ];

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }
    if (
      participantIds.length < 3 ||
      participantIds.some((id) => !mongoose.isValidObjectId(id))
    ) {
      return res
        .status(400)
        .json({ message: "Select at least two valid members" });
    }

    const users = await User.find({ _id: { $in: participantIds } }).select(
      "name email",
    );
    if (users.length !== participantIds.length) {
      return res.status(404).json({ message: "One or more members not found" });
    }

    const group = await Conversations.create({
      name: name.trim(),
      isGroup: true,
      participants: participantIds,
    });
    const result = await Conversations.findById(group._id).populate(
      "participants",
      "name email",
    );
    const socketIds = getReceiverSocketIds(
      participantIds.filter((id) => id !== String(req.user._id)),
    );
    socketIds.forEach((socketId) =>
      io.to(socketId).emit("groupCreated", result),
    );
    res.status(201).json(result);
  } catch (error) {
    console.log("Error from create group", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Conversations.find({
      isGroup: true,
      participants: req.user._id,
    })
      .populate("participants", "name email")
      .sort({ updatedAt: -1 });
    res.status(200).json(groups);
  } catch (error) {
    console.log("Error from get groups", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: groupId } = req.params;
    if (
      !mongoose.isValidObjectId(groupId) ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res
        .status(400)
        .json({ message: "Valid group and message are required" });
    }

    const group = await Conversations.findOne({
      _id: groupId,
      isGroup: true,
      participants: req.user._id,
    });
    if (!group) return res.status(404).json({ message: "Group not found" });

    const newMessage = await Message.create({
      senderId: req.user._id,
      conversationId: group._id,
      message: message.trim(),
    });
    group.message.push(newMessage._id);
    await group.save();

    const messageWithSender = await Message.findById(newMessage._id).populate(
      "senderId",
      "name email",
    );

    const socketIds = getReceiverSocketIds(
      group.participants.filter((id) => String(id) !== String(req.user._id)),
    );
    socketIds.forEach((socketId) =>
      io.to(socketId).emit("newMessage", messageWithSender),
    );
    res.status(201).json({
      message: "Message sent successfully",
      newMessage: messageWithSender,
    });
  } catch (error) {
    console.log("Error from send group message", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const group = await Conversations.findOne({
      _id: req.params.id,
      isGroup: true,
      participants: req.user._id,
    }).populate({
      path: "message",
      populate: { path: "senderId", select: "name email" },
    });
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json(group.message);
  } catch (error) {
    console.log("Error from get group messages", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: chatUser } = req.params;
    const senderId = req.user._id;
    if (!mongoose.isValidObjectId(chatUser)) {
      return res.status(400).json({ message: "Invalid conversation user" });
    }
    const conversation = await Conversations.findOne({
      participants: { $all: [senderId, chatUser] },
    }).populate("message");

    if (!conversation) {
      return res.status(200).json([]);
    }
    const message = conversation.message;
    res.status(200).json(message);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
