import mongoose, { Schema } from "mongoose";

const LessonResourceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    area: { type: String, required: true },
    lessonKey: { type: String, required: true, uppercase: true, trim: true },
    lessonTitle: { type: String, required: true, trim: true },
    resourceType: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    oracleRelease: { type: String, default: "" },
    mandatory: { type: Number, default: 0 },
    visible: { type: Number, default: 0 },
    reviewedAt: { type: String, required: true },
    reviewedBy: { type: String, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { timestamps: false }
);

LessonResourceSchema.index({ lessonKey: 1 });
LessonResourceSchema.index({ visible: 1 });

export const LessonResource =
  mongoose.models.LessonResource ||
  mongoose.model("LessonResource", LessonResourceSchema);
export default LessonResource;
