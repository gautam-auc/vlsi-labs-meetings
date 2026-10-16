import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWorkspaceAuditLog extends Document {
  action: string;
  admin: string;
  details: string;
  type: "auth" | "meeting" | "storage" | "admin";
  createdAt: Date;
}

const WorkspaceAuditLogSchema = new Schema<IWorkspaceAuditLog>(
  {
    action: { type: String, required: true },
    admin: { type: String, required: true },
    details: { type: String, required: true },
    type: {
      type: String,
      enum: ["auth", "meeting", "storage", "admin"],
      default: "admin",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const WorkspaceAuditLog: Model<IWorkspaceAuditLog> =
  mongoose.models.WorkspaceAuditLog ||
  mongoose.model<IWorkspaceAuditLog>("WorkspaceAuditLog", WorkspaceAuditLogSchema);

export default WorkspaceAuditLog;
