import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITraineeProgress extends Document {
  email: string;
  itemType: string;
  itemId: string;
  area: string;
  title: string;
  level: number | null;
  status: "not_started" | "in_progress" | "submitted" | "reviewed" | "completed";
  notes: string;
  trainerFeedback: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  requirementScore: number;
  designScore: number;
  uatScore: number;
  evidenceScore: number;
  updatedAt: string;
}

const TraineeProgressSchema = new Schema<ITraineeProgress>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    itemType: { type: String, required: true, trim: true },
    itemId: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    level: { type: Number, default: null },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "submitted", "reviewed", "completed"],
      default: "not_started",
    },
    notes: { type: String, default: "" },
    trainerFeedback: { type: String, default: "" },
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: String, default: null },
    requirementScore: { type: Number, default: 0 },
    designScore: { type: Number, default: 0 },
    uatScore: { type: Number, default: 0 },
    evidenceScore: { type: Number, default: 0 },
    updatedAt: { type: String, required: true },
  },
  { timestamps: false }
);

TraineeProgressSchema.index({ email: 1, itemType: 1, itemId: 1 }, { unique: true });

export const TraineeProgress: Model<ITraineeProgress> =
  mongoose.models.TraineeProgress ||
  mongoose.model<ITraineeProgress>("TraineeProgress", TraineeProgressSchema);
export default TraineeProgress;
