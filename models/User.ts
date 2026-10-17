import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "host" | "admin";
  workspace?: string;
  profilePreferences?: {
    theme?: "light" | "dark";
    autoMute?: boolean;
    autoCameraOff?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["user", "host", "admin"],
      default: "user",
    },
    workspace: {
      type: String,
      trim: true,
      default: "VLSI Labs Engineering",
    },
    profilePreferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "dark",
      },
      autoMute: {
        type: Boolean,
        default: false,
      },
      autoCameraOff: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model compilation overwrite during Next.js hot reload
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
