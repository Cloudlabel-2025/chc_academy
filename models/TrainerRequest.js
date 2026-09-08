import mongoose, { Schema } from "mongoose";

const TrainerRequestSchema = new Schema(
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

export const TrainerRequest =
  mongoose.models.TrainerRequest ||
  mongoose.model("TrainerRequest", TrainerRequestSchema);
export default TrainerRequest;
