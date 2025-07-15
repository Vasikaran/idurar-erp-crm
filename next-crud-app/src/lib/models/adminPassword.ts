import { Schema, model, models, Types } from "mongoose";

export interface IAdminPassword {
  _id: string;
  removed: boolean;
  user: Types.ObjectId;
  password: string;
  salt: string;
  emailToken?: string;
  resetToken?: string;
  emailVerified: boolean;
  authType: string;
  loggedSessions: string[];
}

const AdminPasswordSchema = new Schema<IAdminPassword>({
  removed: { type: Boolean, default: false },
  user: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  emailToken: String,
  resetToken: String,
  emailVerified: { type: Boolean, default: false },
  authType: { type: String, default: "email" },
  loggedSessions: { type: [String], default: [] },
});

export const AdminPassword =
  models.AdminPassword ||
  model<IAdminPassword>("AdminPassword", AdminPasswordSchema);
