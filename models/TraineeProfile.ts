import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITraineeProfile extends Document {
  email: string;
  fullName: string;
  cohort: string;
  targetLevel: number;
  experienceGoal: string;
  learningPath: "functional" | "technical" | "both";
  customerRoute: "career" | "professional";
  subscriptionPlan: "foundation" | "practitioner" | "guided";
  masteryArea: string;
  approvedLevel: number;
  levelFeedback: string;
  levelApprovedBy: string | null;
  levelApprovedAt: string | null;
  joinedAt: string;
  updatedAt: string;
}

const TraineeProfileSchema = new Schema<ITraineeProfile>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    cohort: { type: String, required: true, trim: true },
    targetLevel: { type: Number, required: true, default: 3 },
    experienceGoal: { type: String, required: true, default: "2–4 years" },
    learningPath: {
      type: String,
      enum: ["functional", "technical", "both"],
      default: "both",
    },
    customerRoute: {
      type: String,
      enum: ["career", "professional"],
      default: "career",
    },
    subscriptionPlan: {
      type: String,
      enum: ["foundation", "practitioner", "guided"],
      default: "practitioner",
    },
    masteryArea: { type: String, default: "" },
    approvedLevel: { type: Number, default: 0 },
    levelFeedback: { type: String, default: "" },
    levelApprovedBy: { type: String, default: null },
    levelApprovedAt: { type: String, default: null },
    joinedAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { timestamps: false }
);

export const TraineeProfile: Model<ITraineeProfile> =
  mongoose.models.TraineeProfile ||
  mongoose.model<ITraineeProfile>("TraineeProfile", TraineeProfileSchema);
export default TraineeProfile;
