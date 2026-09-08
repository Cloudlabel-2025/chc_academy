import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInterviewAudio extends Document {
  id: string;
  email: string;
  sessionId: string;
  questionIndex: number;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
}

const InterviewAudioSchema = new Schema<IInterviewAudio>(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    sessionId: { type: String, required: true },
    questionIndex: { type: Number, required: true },
    cloudinaryPublicId: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    contentType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    createdAt: { type: String, required: true },
  },
  { timestamps: false }
);

InterviewAudioSchema.index({ email: 1, sessionId: 1 });

export const InterviewAudio: Model<IInterviewAudio> =
  mongoose.models.InterviewAudio ||
  mongoose.model<IInterviewAudio>("InterviewAudio", InterviewAudioSchema);
export default InterviewAudio;
