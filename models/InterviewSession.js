import mongoose, { Schema } from "mongoose";

const InterviewSessionSchema = new Schema(
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

export const InterviewSession =
  mongoose.models.InterviewSession ||
  mongoose.model("InterviewSession", InterviewSessionSchema);
export default InterviewSession;
