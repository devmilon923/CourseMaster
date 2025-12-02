import { Document, Types } from "mongoose";

export type ICourse = {
  name: string;
  price: number;
  instructor: string;
  description: string;
  category: string;
  status: "private" | "public";
  image: string;
} & Document;

export type IModule = {
  course: Types.ObjectId;
  name: string;
  totalVideoCount: number;
  orderBy: number;
  description: string;
  status: "private" | "public";
} & Document;

export type IVideo = {
  module: Types.ObjectId;
  name: string;
  orderBy: number;
  completedBy: Types.ObjectId[];
  description: string;
  videoLink: string;
} & Document;

export type IQuiz = {
  module: Types.ObjectId;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  mark: number;
  completedBy: Types.ObjectId[];
} & Document;

export type IQuizResult = {
  module: Types.ObjectId;
  user: Types.ObjectId;
  question: Types.ObjectId;
  answer: string;
  mark: number;
} & Document;

export type IAssignment = {
  module: Types.ObjectId;
  user: Types.ObjectId;
  link: string;
  status: "pending" | "accepted" | "rejected";
} & Document;

export type IEnrollRequest = {
  course: Types.ObjectId;
  user: Types.ObjectId;
  additionalNote: string;
  status: "pending" | "accepted" | "rejected";
} & Document;
