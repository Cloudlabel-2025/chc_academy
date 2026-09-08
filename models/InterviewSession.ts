import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInterviewSession extends Document {
  id: string;
  email: string;
  area: string;
  years: number;
  score: number;
  strengths: string;
  gaps: string;
  answersJson: string;
  createdAt: string;
}

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    area: { type: String, required: true },
    years: { type: Number, required: true },
    score: { type: Number, required: true },
    strengths: { type: String, default: "" },
    gaps: { type: String, default: "" },
    answersJson: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { timestamps: false }
);

InterviewSessionSchema.index({ email: 1, createdAt: -1 });

export const InterviewSession: Model<IInterviewSession> =
  mongoose.models.InterviewSession ||
  mongoose.model<IInterviewSession>("InterviewSession", InterviewSessionSchema);
export default InterviewSession;
