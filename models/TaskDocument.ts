import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITaskDocument extends Document {
  id: string;
  email: string;
  taskId: string;
  documentType: string;
  fileName: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

const TaskDocumentSchema = new Schema<ITaskDocument>(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    taskId: { type: String, required: true, trim: true },
    documentType: { type: String, required: true },
    fileName: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    contentType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    uploadedAt: { type: String, required: true },
  },
  { timestamps: false }
);

TaskDocumentSchema.index({ email: 1, taskId: 1 });

export const TaskDocument: Model<ITaskDocument> =
  mongoose.models.TaskDocument ||
  mongoose.model<ITaskDocument>("TaskDocument", TaskDocumentSchema);
export default TaskDocument;
