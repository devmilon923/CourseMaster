import { Schema, model } from "mongoose";
import {
  ICourse,
  IModule,
  IVideo,
  IQuiz,
  IQuizResult,
  IAssignment,
  IEnrollRequest,
} from "./course.interface";

// Course Schema
const courseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Web Development",
        "Graphic Design & Illustration",
        "Marketing & Sales",
        "Communication Skills",
      ],
    },
    status: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Add search indexes for Course
courseSchema.index({ name: "text", description: "text", category: "text" });
courseSchema.index({ name: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ status: 1 });

// Module Schema
const moduleSchema = new Schema<IModule>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    totalVideoCount: {
      type: Number,
      required: true,
      default: 0,
    },
    orderBy: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
  },
  { timestamps: true }
);

// Add search indexes for Module
moduleSchema.index({ name: "text", description: "text" });
moduleSchema.index({ course: 1 });
moduleSchema.index({ name: 1 });
moduleSchema.index({ status: 1 });
moduleSchema.index({ course: 1, orderBy: 1 });

// Video Schema
const videoSchema = new Schema<IVideo>(
  {
    module: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    orderBy: {
      type: Number,
      required: true,
    },
    completedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
    description: {
      type: String,
      required: true,
    },
    videoLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Add search indexes for Video
videoSchema.index({ name: "text", description: "text" });
videoSchema.index({ module: 1 });
videoSchema.index({ name: 1 });
videoSchema.index({ module: 1, orderBy: 1 });

// Quiz Schema
const quizSchema = new Schema<IQuiz>(
  {
    module: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    optionA: {
      type: String,
      required: true,
    },
    optionB: {
      type: String,
      required: true,
    },
    optionC: {
      type: String,
      required: true,
    },
    optionD: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D"],
    },
    mark: {
      type: Number,
      required: true,
    },
    completedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Add search indexes for Quiz
quizSchema.index({ question: "text" });
quizSchema.index({ module: 1 });

// Quiz Result Schema
const quizResultSchema = new Schema<IQuizResult>(
  {
    module: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    mark: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Add search indexes for Quiz Result
quizResultSchema.index({ user: 1 });
quizResultSchema.index({ module: 1 });
quizResultSchema.index({ question: 1 });
quizResultSchema.index({ user: 1, module: 1 });

// Assignment Schema
const assignmentSchema = new Schema<IAssignment>(
  {
    module: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Add search indexes for Assignment
assignmentSchema.index({ user: 1 });
assignmentSchema.index({ module: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ user: 1, module: 1 });

// Enroll Request Schema
const enrollRequestSchema = new Schema<IEnrollRequest>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    additionalNote: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Add search indexes for Enroll Request
enrollRequestSchema.index({ user: 1 });
enrollRequestSchema.index({ course: 1 });
enrollRequestSchema.index({ status: 1 });
enrollRequestSchema.index({ user: 1, course: 1 });

// Models
export const Course = model<ICourse>("Course", courseSchema);
export const Module = model<IModule>("Module", moduleSchema);
export const Video = model<IVideo>("Video", videoSchema);
export const Quiz = model<IQuiz>("Quiz", quizSchema);
export const QuizResult = model<IQuizResult>("QuizResult", quizResultSchema);
export const Assignment = model<IAssignment>("Assignment", assignmentSchema);
export const EnrollRequest = model<IEnrollRequest>(
  "EnrollRequest",
  enrollRequestSchema
);
