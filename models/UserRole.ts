import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserRole extends Document {
  email: string;
  role: "admin" | "approver" | "trainer" | "trainee";
  grantedBy: string;
  grantedAt: string;
  updatedAt: string;
}

const UserRoleSchema = new Schema<IUserRole>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: ["admin", "approver", "trainer", "trainee"],
      required: true,
    },
    grantedBy: { type: String, required: true },
    grantedAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { timestamps: false }
);

export const UserRole: Model<IUserRole> =
  mongoose.models.UserRole || mongoose.model<IUserRole>("UserRole", UserRoleSchema);
export default UserRole;
