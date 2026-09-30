// backend/controllers/adminController/adminController.js

import User from "../../model/userModel.js";
import AdminAudit from "../../model/admin.model.js";
import bcrypt from "bcrypt";
import Conversations from "../../model/conversation.model.js";
import Message from "../../model/message.model.js";
import { io } from "../../socket/server.js";

// ───────── Helper: Audit Log ─────────
const logAdminAction = async (
  action,
  performedBy,
  targetUser = null,
  meta = {},
) => {
  try {
    await AdminAudit.create({
      action,
      performedBy,
      targetUser,
      meta,
    });
  } catch (err) {
    console.error("Failed to log admin action:", err.message);
  }
};

// ───────── GET /admin/users ─────────
export const getAllUsers = async (req, res) => {
  try {
    const { search = "", status = "all", page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "online") filter.isOnline = true;
    else if (status === "offline") filter.isOnline = false;
    else if (status === "blocked") filter.isBlocked = true;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)) || 1,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ───────── GET /admin/users/:id ─────────
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// ───────── POST /admin/users ─────────
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role === "admin" ? "admin" : "user",
    });

    await logAdminAction("CREATE_USER", req.user._id, user._id, {
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    res
      .status(201)
      .json({ message: "User created successfully", user: safeUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

// ───────── PUT /admin/users/:id ─────────
export const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldData = { name: user.name, email: user.email, role: user.role };

    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ["user", "admin"].includes(role)) user.role = role;

    await user.save();

    await logAdminAction("UPDATE_USER", req.user._id, user._id, {
      before: oldData,
      after: { name: user.name, email: user.email, role: user.role },
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    // Live update for admin dashboard
    io.emit("admin:userUpdated", { userId: user._id, user: safeUser });

    res.status(200).json({ message: "User updated", user: safeUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

// ───────── DELETE /admin/users/:id ─────────
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent self-delete
    if (String(userId) === String(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cascade: remove messages + clean conversations
    await Message.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    await Conversations.updateMany(
      { participants: userId },
      { $pull: { participants: userId } },
    );

    // Delete empty conversations (optional)
    await Conversations.deleteMany({ participants: { $size: 0 } });

    await User.findByIdAndDelete(userId);

    await logAdminAction("DELETE_USER", req.user._id, userId, {
      name: user.name,
      email: user.email,
    });

    io.emit("admin:userDeleted", { userId });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// ───────── PATCH /admin/users/:id/block ─────────
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    user.isBlocked = !user.isBlocked;

    // Force offline when blocked
    if (user.isBlocked) {
      user.isOnline = false;
    }

    await user.save();

    const action = user.isBlocked ? "BLOCK_USER" : "UNBLOCK_USER";
    await logAdminAction(action, req.user._id, user._id, {
      isBlocked: user.isBlocked,
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    io.emit("admin:userUpdated", { userId: user._id, user: safeUser });
    io.emit("userStatusChanged", { userId: user._id, isOnline: user.isOnline });

    res.status(200).json({
      message: user.isBlocked ? "User blocked" : "User unblocked",
      user: safeUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to toggle block" });
  }
};

// ───────── PATCH /admin/users/:id/role ─────────
export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent self-demote
    if (String(user._id) === String(req.user._id) && role === "user") {
      return res.status(400).json({ message: "You cannot demote yourself" });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    const action = role === "admin" ? "PROMOTE_USER" : "DEMOTE_USER";
    await logAdminAction(action, req.user._id, user._id, {
      from: oldRole,
      to: role,
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    io.emit("admin:userUpdated", { userId: user._id, user: safeUser });

    res.status(200).json({
      message: `User role changed to ${role}`,
      user: safeUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to change role" });
  }
};

// ───────── GET /admin/stats ─────────
export const getStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      onlineUsers,
      offlineUsers,
      blockedUsers,
      newUsersToday,
      totalMessages,
      totalConversations,
      totalGroups,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isOnline: true }),
      User.countDocuments({ isOnline: false }),
      User.countDocuments({ isBlocked: true }),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      Message.countDocuments(),
      Conversations.countDocuments(),
      Conversations.countDocuments({ isGroup: true }),
    ]);

    res.status(200).json({
      totalUsers,
      onlineUsers,
      offlineUsers,
      blockedUsers,
      totalMessages,
      totalGroups,
      totalConversations,
      newUsersToday,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// ───────── GET /admin/activity ─────────
export const getActivity = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AdminAudit.find()
        .populate("performedBy", "name email")
        .populate("targetUser", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AdminAudit.countDocuments(),
    ]);

    res.status(200).json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)) || 1,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch activity log" });
  }
};

// ───────── GET /admin/analytics?range=7d|30d ─────────
export const getAnalytics = async (req, res) => {
  try {
    const range = req.query.range === "30d" ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);
    startDate.setHours(0, 0, 0, 0);

    // Helper to fill missing days
    const fillDays = (data, days) => {
      const map = Object.fromEntries(data.map((d) => [d._id, d.count]));
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        result.push({ date: key, count: map[key] || 0 });
      }
      return result;
    };

    // Signups per day
    const signups = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Logins approximation (using lastLogin)
    const logins = await User.aggregate([
      { $match: { lastLogin: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastLogin" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Messages per day
    const messages = await Message.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      signupsPerDay: fillDays(signups, range),
      messagesPerDay: fillDays(messages, range),
      activeUsersPerDay: fillDays([], range), // can enhance later
      loginCountPerDay: fillDays(logins, range),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};
