import mongoose from "mongoose";

const adminAuditSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE_USER",
        "UPDATE_USER",
        "DELETE_USER",
        "BLOCK_USER",
        "UNBLOCK_USER",
        "PROMOTE_USER",
        "DEMOTE_USER",
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const AdminAudit = mongoose.model("AdminAudit", adminAuditSchema);
export default AdminAudit;