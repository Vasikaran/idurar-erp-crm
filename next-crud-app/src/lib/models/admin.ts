import { Schema, model, models } from "mongoose";

export interface IAdmin {
  _id: string;
  removed: boolean;
  enabled: boolean;
  email: string;
  name: string;
  surname?: string;
  photo?: string;
  created: Date;
  role: "owner";
}

const AdminSchema = new Schema<IAdmin>({
  removed: { type: Boolean, default: false },
  enabled: { type: Boolean, default: false },
  email: { type: String, lowercase: true, trim: true, required: true },
  name: { type: String, required: true },
  surname: { type: String },
  photo: { type: String, trim: true },
  created: { type: Date, default: Date.now },
  role: { type: String, default: "owner", enum: ["owner"] },
});

export const Admin = models.Admin || model<IAdmin>("Admin", AdminSchema);
