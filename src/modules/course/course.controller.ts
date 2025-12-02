import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { Course, Module, Quiz, Video } from "./course.model";
import mongoose from "mongoose";
import { isValidYouTubeUrl } from "../../utils/youtubeURL";
import { IUserPayload } from "../../middlewares/roleGuard";
import paginationBuilder from "../../utils/paginationBuilder";

const createCourse = catchAsync(async (req: Request, res: Response) => {
  if (!req.file?.filename) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Course image is required");
  }
  const data: any = {
    name: req.body.name as string,
    price: parseInt(req.body.price as string),
    instructor: req.body.instructor as string,
    description: req.body.description as string,
    category: req.body.category,
    image: `/images${req.file.filename}`,
  };
  const result = await Course.findOneAndUpdate(data, data, {
    new: true,
    runValidators: true,
    upsert: true,
  });
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course created succesfully",
    data: result,
  });
});

const addModule = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.courseId;
  const courseValidation = await Course.countDocuments({
    _id: new mongoose.Types.ObjectId(courseId || "n/a"),
  });
  if (!courseValidation) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid course id");
  }
  const data: any = {
    name: req.body.name as string,
    course: new mongoose.Types.ObjectId(courseId || "n/a"),
    orderBy: parseFloat(req.body.orderBy),
    description: req.body.description as string,
  };
  const result = await Module.findOneAndUpdate(data, data, {
    new: true,
    runValidators: true,
    upsert: true,
  });
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Module added succesfully",
    data: result,
  });
});
const addVideo = catchAsync(async (req: Request, res: Response) => {
  const moduleId = req.params.moduleId;
  if (!req.body.videoLink || !isValidYouTubeUrl(req.body.videoLink)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid url format it's only support youtube video"
    );
  }
  const moduleValidation = await Module.countDocuments({
    _id: new mongoose.Types.ObjectId(moduleId || "n/a"),
  });
  if (!moduleValidation) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid module id");
  }
  const data: any = {
    name: req.body.name as string,
    description: req.body.description as string,
    module: new mongoose.Types.ObjectId(moduleId || "n/a"),
    videoLink: req.body.videoLink,
    orderBy: req.body.orderBy,
  };
  const result = await Video.findOneAndUpdate(data, data, {
    new: true,
    runValidators: true,
    upsert: true,
  });
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Video added succesfully",
    data: result,
  });
});
const addQuiz = catchAsync(async (req: Request, res: Response) => {
  const moduleId = req.params.moduleId;
  const moduleValidation = await Module.countDocuments({
    _id: new mongoose.Types.ObjectId(moduleId || "n/a"),
  });
  if (!moduleValidation) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid module id");
  }
  const data: any = {
    module: new mongoose.Types.ObjectId(moduleId || "n/a"),
    question: req.body.question as string,
    optionA: req.body.optionA as string,
    optionB: req.body.optionB as string,
    optionC: req.body.optionC as string,
    optionD: req.body.optionD as string,
    answer: req.body.answer,
    mark: parseInt(req.body.mark),
  };
  const result = await Quiz.findOneAndUpdate(data, data, {
    new: true,
    runValidators: true,
    upsert: true,
  });
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz added succesfully",
    data: result,
  });
});
const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.courseId;

  if (req?.file?.filename) {
    req.body.image = `/images/${req.file.filename}`;
  }
  const result = await Course.findByIdAndUpdate(courseId, req.body, {
    new: true,
    runValidators: true,
  });
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course data updated succesfully",
    data: result,
  });
});

const courseDetails = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.courseId;
  const result = await Course.findById(courseId).lean();
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid course");
  }
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course details get succesfully",
    data: { ...result, totalEnroll: 0, totalModule: 0 },
  });
});

const getCourses = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const searchQ = req.query?.searchQ as string;
  const priceSort = req.query?.sort as string;
  const category = req.query?.category as string;
  let sort: any = { createdAt: -1 };
  let query: any = {};
  if (user.role === "user") {
    query.status = "public";
  }
  if (searchQ?.trim()) {
    query.$or = [
      {
        name: { $regex: searchQ, $options: "i" },
      },
      {
        instructor: { $regex: searchQ, $options: "i" },
      },
    ];
  }
  if (priceSort?.trim() && priceSort === "low") {
    sort = { price: 1 };
  } else if (priceSort?.trim() && priceSort === "high") {
    sort = { price: -1 };
  }
  if (category?.trim()) {
    query.category = { $regex: category, $options: "i" };
  }
  const result = await Course.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const totalData = await Course.countDocuments(query);
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Course get succesfully",
    data: result,
    pagination,
  });
});
export const CourseController = {
  createCourse,
  addModule,
  addVideo,
  addQuiz,
  updateCourse,
  courseDetails,
  getCourses,
};
