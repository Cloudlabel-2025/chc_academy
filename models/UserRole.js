import mongoose, { Schema } from "mongoose";

const UserRoleSchema = new Schema(
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

export const UserRole =
  mongoose.models.UserRole || mongoose.model("UserRole", UserRoleSchema);
export default UserRole;
