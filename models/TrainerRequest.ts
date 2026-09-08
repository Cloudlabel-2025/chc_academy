import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITrainerRequest extends Document {
  email: string;
  fullName: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  decidedBy: string | null;
  decidedAt: string | null;
  decisionNote: string;
}

const TrainerRequestSchema = new Schema<ITrainerRequest>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestedAt: { type: String, required: true },
    decidedBy: { type: String, default: null },
    decidedAt: { type: String, default: null },
    decisionNote: { type: String, default: "" },
  },
  { timestamps: false }
);

export const TrainerRequest: Model<ITrainerRequest> =
  mongoose.models.TrainerRequest ||
  mongoose.model<ITrainerRequest>("TrainerRequest", TrainerRequestSchema);
export default TrainerRequest;
