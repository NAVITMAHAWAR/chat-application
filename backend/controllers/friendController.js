import FriendRequest from "../model/friendRequest.model.js";
import User from "../model/userModel.js";
import mongoose from "mongoose";
import { getReceiverSocketIds, io } from "../socket/server.js";

// ───── Send Request ─────
export const sendFriendRequest = async (req, res) => {
  try {
    const from = req.user._id;
    const { toUserId } = req.body;

    if (!mongoose.isValidObjectId(toUserId)) {
      return res.status(400).json({ message: "Invalid user" });
    }
    if (String(from) === String(toUserId)) {
      return res
        .status(400)
        .json({ message: "Cannot send request to yourself" });
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(404).json({ message: "User not found" });

    // Already friends?
    const me = await User.findById(from);
    if (me.friends?.some((id) => String(id) === String(toUserId))) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Existing request either direction?
    const existing = await FriendRequest.findOne({
      $or: [
        { from, to: toUserId },
        { from: toUserId, to: from },
      ],
    });

    if (existing) {
      if (existing.status === "pending") {
        return res.status(400).json({ message: "Request already pending" });
      }
      if (existing.status === "accepted") {
        return res.status(400).json({ message: "Already friends" });
      }
      // rejected → allow new request: delete old
      await FriendRequest.deleteOne({ _id: existing._id });
    }

    const request = await FriendRequest.create({
      from,
      to: toUserId,
      status: "pending",
    });

    const populated = await FriendRequest.findById(request._id)
      .populate("from", "name email")
      .populate("to", "name email");

    // Real-time notify receiver
    const receiverSocketIds = getReceiverSocketIds([toUserId]);
    receiverSocketIds.forEach((receiverSocketId) => {
      io.to(receiverSocketId).emit("friendRequest", populated);
    });

    res
      .status(201)
      .json({ message: "Friend request sent", request: populated });
  } catch (error) {
    console.log("sendFriendRequest error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ───── Accept Request ─────
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const { requestId } = req.params;
    console.log(requestId);

    const request = await FriendRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (String(request.to) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this request" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    request.status = "accepted";
    await request.save();

    // Add each other as friends
    await User.findByIdAndUpdate(request.from, {
      $addToSet: { friends: request.to },
    });
    await User.findByIdAndUpdate(request.to, {
      $addToSet: { friends: request.from },
    });

    const populated = await FriendRequest.findById(request._id)
      .populate("from", "name email")
      .populate("to", "name email");

    // Notify sender
    const senderSocketIds = getReceiverSocketIds([request.from]);
    senderSocketIds.forEach((senderSocketId) => {
      io.to(senderSocketId).emit("friendRequestAccepted", populated);
    });

    res
      .status(200)
      .json({ message: "Friend request accepted", request: populated });
  } catch (error) {
    console.log("acceptFriendRequest error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ───── Reject Request ─────
export const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (String(request.to) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.log("rejectFriendRequest error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ───── Cancel own sent request ─────
export const cancelFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (String(request.from) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    await FriendRequest.deleteOne({ _id: requestId });
    res.status(200).json({ message: "Request cancelled" });
  } catch (error) {
    console.log("cancelFriendRequest error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ───── Get my friends ─────
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "name email isOnline")
      .select("friends");

    res.status(200).json({ friends: user?.friends || [] });
  } catch (error) {
    console.log("getFriends error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ───── Incoming pending requests ─────
export const getIncomingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      to: req.user._id,
      status: "pending",
    })
      .populate("from", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.log("getIncomingRequests error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ───── Outgoing pending requests ─────
export const getOutgoingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      from: req.user._id,
      status: "pending",
    })
      .populate("to", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.log("getOutgoingRequests error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ───── Search users to add (not already friends / not self) ─────
export const searchUsers = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const me = await User.findById(req.user._id).select("friends");
    const friendIds = (me?.friends || []).map(String);
    friendIds.push(String(req.user._id));

    const filter = {
      _id: { $nin: friendIds },
    };
    if (q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: "i" } },
        { email: { $regex: q.trim(), $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("name email isOnline")
      .limit(20)
      .sort({ name: 1 });

    // Attach request status if any
    const pending = await FriendRequest.find({
      status: "pending",
      $or: [
        { from: req.user._id, to: { $in: users.map((u) => u._id) } },
        { to: req.user._id, from: { $in: users.map((u) => u._id) } },
      ],
    });

    const result = users.map((u) => {
      const sent = pending.find(
        (r) =>
          String(r.from) === String(req.user._id) &&
          String(r.to) === String(u._id),
      );
      const received = pending.find(
        (r) =>
          String(r.to) === String(req.user._id) &&
          String(r.from) === String(u._id),
      );
      return {
        ...u.toObject(),
        requestStatus: sent ? "sent" : received ? "received" : "none",
        requestId: sent?._id || received?._id || null,
      };
    });

    res.status(200).json({ users: result });
  } catch (error) {
    console.log("searchUsers error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ───── Unfriend ─────
export const unfriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.params;

    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    // Clean accepted requests between them
    await FriendRequest.deleteMany({
      status: "accepted",
      $or: [
        { from: userId, to: friendId },
        { from: friendId, to: userId },
      ],
    });

    res.status(200).json({ message: "Unfriended successfully" });
  } catch (error) {
    console.log("unfriend error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
