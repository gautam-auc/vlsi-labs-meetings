import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMeeting extends Document {
  meetingId: string;
  title: string;
  description?: string;
  hostId?: string;
  hostEmail?: string;
  hostName?: string;
  date: string;
  time: string;
  duration?: string;
  mode: "instant" | "scheduled";
  status: "upcoming" | "live" | "completed" | "cancelled";
  participants: string[];
  accessSettings?: {
    isPrivate?: boolean;
    requireHostApproval?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    meetingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Meeting title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    hostId: {
      type: String,
      default: "guest-host",
    },
    hostEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    hostName: {
      type: String,
      trim: true,
      default: "Meeting Host",
    },
    date: {
      type: String,
      required: true,
      default: "Today",
    },
    time: {
      type: String,
      required: true,
      default: "Now",
    },
    duration: {
      type: String,
      default: "30",
    },
    mode: {
      type: String,
      enum: ["instant", "scheduled"],
      default: "instant",
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "completed", "cancelled"],
      default: "upcoming",
    },
    participants: {
      type: [String],
      default: [],
    },
    accessSettings: {
      isPrivate: {
        type: Boolean,
        default: false,
      },
      requireHostApproval: {
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
export const Meeting: Model<IMeeting> =
  mongoose.models.Meeting || mongoose.model<IMeeting>("Meeting", MeetingSchema);
