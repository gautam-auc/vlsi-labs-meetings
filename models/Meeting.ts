import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMeeting extends Document {
  id: string; // e.g. room-slug or VLSI-room ID
  title: string;
  host: string;
  hostEmail: string;
  date: string;
  time: string;
  duration: string;
  status: "live" | "upcoming" | "completed";
  participants: string[];
  notes?: string;
  recordingsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    host: { type: String, required: true },
    hostEmail: { type: String, default: "admin@vlsilabs.com" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: String, default: "45 mins" },
    status: {
      type: String,
      enum: ["live", "upcoming", "completed"],
      default: "upcoming",
    },
    participants: { type: [String], default: [] },
    notes: { type: String, default: "" },
    recordingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Meeting: Model<IMeeting> =
  mongoose.models.Meeting || mongoose.model<IMeeting>("Meeting", MeetingSchema);

export default Meeting;
