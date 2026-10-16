import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "super-admin" | "admin" | "engineer" | "guest";
  isGuest: boolean;
  provider: "email" | "google" | "guest";
  avatar?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["super-admin", "admin", "engineer", "guest"],
      default: "engineer",
    },
    isGuest: { type: Boolean, default: false },
    provider: {
      type: String,
      enum: ["email", "google", "guest"],
      default: "email",
    },
    avatar: { type: String },
    department: { type: String, default: "VLSI Engineering" },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
