import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  meetingId: string;
  senderName: string;
  senderEmail?: string;
  text: string;
  time: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    meetingId: {
      type: String,
      required: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
      default: "Participant",
    },
    senderEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    time: {
      type: String,
      default: () =>
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  },
  {
    timestamps: true,
  }
);

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
