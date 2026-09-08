import mongoose, { Schema } from "mongoose";

const TraineeTimeLogSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    taskId: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    weekStart: { type: String, required: true, trim: true },
    designMinutes: { type: Number, required: true, default: 0 },
    configurationMinutes: { type: Number, required: true, default: 0 },
    uatMinutes: { type: Number, required: true, default: 0 },
    updatedAt: { type: String, required: true },
  },
  { timestamps: false }
);

TraineeTimeLogSchema.index({ email: 1, taskId: 1, weekStart: 1 }, { unique: true });

export const TraineeTimeLog =
  mongoose.models.TraineeTimeLog ||
  mongoose.model("TraineeTimeLog", TraineeTimeLogSchema);
export default TraineeTimeLog;
