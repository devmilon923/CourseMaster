import mongoose, { Document, ObjectId } from "mongoose";
import { TRole } from "../../config/role";
export const MoodEnum = ["Peaceful", "Grateful", "Hopeful", "Lonely", "Sad"];
export type IUser = {
  name: string;
  email: string;
  password: string;
  gender?: "male" | "female" | "other";
  address?: string;
  phone?: number;
  image: string;
  isVerified: boolean;
  blockStatus: Date | null;
  role: TRole;
  isRequest?: "approve" | "deny" | "send";
  isDeleted: boolean;
  fcmToken?: string;
} & Document;

export type IOTP = {
  email: string;
  otp: string;
  expiresAt: Date;
} & Document;
