import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITraineeTimeLog extends Document {
  email: string;
  taskId: string;
  area: string;
  weekStart: string;
  designMinutes: number;
  configurationMinutes: number;
  uatMinutes: number;
  updatedAt: string;
}

const TraineeTimeLogSchema = new Schema<ITraineeTimeLog>(
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

export const TraineeTimeLog: Model<ITraineeTimeLog> =
  mongoose.models.TraineeTimeLog ||
  mongoose.model<ITraineeTimeLog>("TraineeTimeLog", TraineeTimeLogSchema);
export default TraineeTimeLog;
