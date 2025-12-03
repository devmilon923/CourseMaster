import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import {
  Assignment,
  Course,
  EnrollRequest,
  Module,
  Quiz,
  QuizResult,
  Video,
} from "./course.model";
import mongoose from "mongoose";
import { isValidYouTubeUrl } from "../../utils/youtubeURL";
import { IUserPayload } from "../../middlewares/roleGuard";
import paginationBuilder from "../../utils/paginationBuilder";
import { IEnrollRequest } from "./course.interface";

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
  const user = req.user as IUserPayload;
  const courseId = req.params.courseId;
  let query: any = {
    _id: new mongoose.Types.ObjectId(courseId || "n/a"),
  };
  let moduleQuery: any = {
    course: new mongoose.Types.ObjectId(courseId || "n/a"),
  };
  if (user?.role === "admin") {
    query.$or = [
      {
        status: "public",
      },
      {
        status: "private",
      },
    ];
    moduleQuery.$or = [
      {
        status: "public",
      },
      {
        status: "private",
      },
    ];
  } else {
    query.status = "public";
    moduleQuery.status = "public";
  }
  const result = await Course.findOne(query).lean();
  const totalModule = await Module.countDocuments(moduleQuery);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course details get succesfully",
    data: result
      ? {
          ...result,
          totalEnroll: result?.enrolledBy?.length,
          totalModule: totalModule,
        }
      : {},
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
  if (user?.role === "admin") {
    query.$or = [
      {
        status: "public",
      },
      {
        status: "private",
      },
    ];
  } else {
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
const sendEnrollRequest = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const courseId = req.params.courseId;
  if (!req.body?.additionalNote) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Additional note is required");
  }
  let query: any = {
    _id: new mongoose.Types.ObjectId(courseId || "n/a"),
    status: "public",
  };
  const result = await Course.findOne(query);
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This course are not available");
  }
  const sendRequest = await EnrollRequest.findOneAndUpdate(
    {
      course: query._id,
      user: new mongoose.Types.ObjectId(user?.id || "n/a"),
      status: { $ne: "accepted" },
    },
    {
      course: query._id,
      user: new mongoose.Types.ObjectId(user.id || "n/a"),
      status: "pending",
      additionalNote: req.body.additionalNote,
    },
    {
      new: true,
      runValidators: true,
      upsert: true,
    }
  );
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course enroll request send succesfully",
    data: sendRequest,
  });
});

const getEnrollRequest = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const status = req.query?.status as string;
  let sort: any = { createdAt: -1 };
  let query: any = {};
  if (user.role === "user") {
    query.user = new mongoose.Types.ObjectId(user.id || "n/a");
  }
  if (status?.trim()) {
    query.status = status;
  }

  const result = await EnrollRequest.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean()
    .populate("user", "name image")
    .populate("course", "name image");
  const totalData = await EnrollRequest.countDocuments(query);
  const pagination = paginationBuilder({ totalData, currentPage: page, limit });
  const response = result.map((request: any) => {
    return {
      _id: request?._id,
      courseId: request?.course?._id,
      courseName: request.course.name,
      courseImage: request.course.image || "",
      user: request.user.name,
      userImage: request.user.image,
      status: request.status,
      note: request.additionalNote || "",
    };
  });
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Enrolled Course get succesfully",
    data: response,
    pagination,
  });
});

const updateEnrollRequest = catchAsync(async (req: Request, res: Response) => {
  const requestId = req.params.requestId;
  const status = req.body.status as string;
  const supportedStatus = ["accepted", "rejected"];
  let query: any = {
    _id: new mongoose.Types.ObjectId(requestId || "n/a"),
  };
  if (!status?.trim() || !supportedStatus.includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Unsupported status value");
  }
  const result = await EnrollRequest.findOneAndUpdate(
    query,
    { status },
    { new: true }
  ).lean();

  if (!result) {
    throw new Error("Enrollment request not found");
  }

  if (status === "accepted") {
    await Course.findByIdAndUpdate(
      result.course,
      { $addToSet: { enrolledBy: result.user } },
      { runValidators: true }
    );
  } else if (status === "rejected") {
    await Course.findByIdAndUpdate(
      result.course,
      { $pull: { enrolledBy: result.user } },
      { runValidators: true }
    );
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Request updated succesfully",
    data: result,
  });
});

const getMyModules = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const courseId = req.params.courseId;
  const isEnrolled = await Course.countDocuments({
    _id: new mongoose.Types.ObjectId(courseId || "n/a"),
    status: "public",
    enrolledBy: { $in: new mongoose.Types.ObjectId(user.id || "n/a") },
  });
  if (!isEnrolled) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Sorry you can't access this course module"
    );
  }
  let query: any = {
    course: new mongoose.Types.ObjectId(courseId || "n/a"),
    status: "public",
  };

  const result = await Module.find(query).sort({ orderBy: -1 }).lean();
  const response = await Promise.all(
    result.map(async (mod: any) => {
      const completedCount = await Video.countDocuments({
        module: new mongoose.Types.ObjectId(mod?._id),
      });
      const percentage = (completedCount / mod.totalVideoCount) * 100;

      return {
        _id: mod._id,
        name: mod.name,
        description: mod.description,
        totalVideoCount: mod.totalVideoCount,
        percentage: percentage ? percentage : 0,
      };
    })
  );
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course modules get succesfully",
    data: response,
  });
});

const getMyModulesVideos = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const moduleId = req.params.moduleId;
  const isValidModule = await Module.countDocuments({
    _id: new mongoose.Types.ObjectId(moduleId || "n/a"),
    status: "public",
  });
  if (!isValidModule) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Sorry you can't access this module videos"
    );
  }

  let query: any = {
    module: new mongoose.Types.ObjectId(moduleId || "n/a"),
  };
  const result = await Video.find(query).sort({ orderBy: -1 }).exec();
  const response = result.map((video: any) => {
    return {
      _id: video._id,
      name: video.name,
      description: video.description,
      videoLink: video.videoLink,
      isCompleted: video.completedBy.includes(
        new mongoose.Types.ObjectId(user.id)
      ),
    };
  });
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Module videos get succesfully",
    data: response,
  });
});

const markCompletedVideo = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const videoId = req.params.videoId;
  const isValidVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $addToSet: { completedBy: new mongoose.Types.ObjectId(user.id || "n/a") },
    },
    { new: true, runValidators: true }
  );
  if (!isValidVideo) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Sorry invalid video id");
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Module videos mark as completed",
    data: isValidVideo,
  });
});

const getModuleQuiz = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const moduleId = req.params.moduleId;
  const isValidModule = await Module.countDocuments({
    _id: new mongoose.Types.ObjectId(moduleId || "n/a"),
    status: "public",
  });
  if (!isValidModule) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Sorry you can't access this module videos"
    );
  }

  let query: any = {
    module: new mongoose.Types.ObjectId(moduleId || "n/a"),
  };
  const result = await Quiz.find(query).sort({ createdAt: -1 }).exec();

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Module quiz get succesfully",
    data: result,
  });
});

const submitAssignment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const moduleId = req.params.moduleId;
  const link = req.body.link;
  if (!link) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Link is required");
  }
  const isValidModule = await Module.countDocuments({
    _id: new mongoose.Types.ObjectId(moduleId || "n/a"),
    status: "public",
  });
  if (!isValidModule) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Sorry you can't access this module videos"
    );
  }

  let query: any = {
    module: new mongoose.Types.ObjectId(moduleId || "n/a"),
    user: new mongoose.Types.ObjectId(user.id || "n/a"),
  };
  const result = await Assignment.findOneAndUpdate(
    query,
    { ...query, link: req.body.link },
    {
      new: true,
      runValidators: true,
      upsert: true,
    }
  )
    .sort({ createdAt: -1 })
    .exec();

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Module assignment submitted succesfully",
    data: result,
  });
});

const getAssignmentSubmisson = catchAsync(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const moduleId = req.params.moduleId;
    const isValidModule = await Module.countDocuments({
      _id: new mongoose.Types.ObjectId(moduleId || "n/a"),
    });
    if (!isValidModule) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Sorry you can't access this module videos"
      );
    }

    let query: any = {
      module: new mongoose.Types.ObjectId(moduleId || "n/a"),
    };
    const result = await Assignment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name image email")
      .exec();
    const response = result.map((assign: any) => {
      return {
        _id: assign?._id,
        userInfo: {
          name: assign.user?.name,
          image: assign.user?.image,
          email: assign.user?.email,
        },
        link: assign.link,
        status: assign.status,
        createdAt: assign.createdAt,
      };
    });
    const totalData = await Assignment.countDocuments(query);
    const pagination = paginationBuilder({
      totalData,
      currentPage: page,
      limit,
    });
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Module assignment get succesfully",
      data: response,
      pagination,
    });
  }
);
const quizSubmit = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserPayload;
  const moduleId = req.params.moduleId;
  const userAnswers: any[] = req.body.answers;
  if (!userAnswers || userAnswers.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User answers is required");
  }
  const isValidModule = await Module.countDocuments({
    _id: new mongoose.Types.ObjectId(moduleId || "n/a"),
    status: "public",
  });
  if (!isValidModule) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Sorry you can't access this module videos"
    );
  }
  const quizs = await Quiz.find({
    module: new mongoose.Types.ObjectId(moduleId || "n/a"),
  }).exec();
  if (quizs.length !== userAnswers.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "All quiz must be answered");
  }

  let correctAnswersCount = 0;
  let incorrectAnswersCount = 0;
  let totalMarks = 0;
  let earnedMarks = 0;

  // Map quiz IDs to quiz objects for easy lookup
  const quizMap = new Map(
    quizs.map((quiz: any) => [quiz._id.toString(), quiz])
  );

  // Process each user answer and save to QuizResult
  const quizResults = await Promise.all(
    userAnswers.map(async (userAnswer: any) => {
      const quizId = userAnswer._id;
      const userAns = userAnswer.answer;
      const quiz = quizMap.get(
        new mongoose.Types.ObjectId(quizId || "n/a").toString()
      );

      if (!quiz) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Invalid quiz id: ${quizId}`
        );
      }

      totalMarks += quiz.mark;

      // Check if answer is correct
      const isCorrect = quiz.answer === userAns;
      if (isCorrect) {
        correctAnswersCount++;
        earnedMarks += quiz.mark;
      } else {
        incorrectAnswersCount++;
      }

      // Save quiz result to database
      const result = await QuizResult.findOneAndUpdate(
        {
          module: new mongoose.Types.ObjectId(moduleId || "n/a"),
          user: new mongoose.Types.ObjectId(user.id || "n/a"),
          question: new mongoose.Types.ObjectId(quizId || "n/a"),
        },
        {
          module: new mongoose.Types.ObjectId(moduleId || "n/a"),
          user: new mongoose.Types.ObjectId(user.id || "n/a"),
          question: new mongoose.Types.ObjectId(quizId || "n/a"),
          answer: userAns,
          mark: isCorrect ? quiz.mark : 0,
        },
        {
          new: true,
          runValidators: true,
          upsert: true,
        }
      );

      return result;
    })
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Module quiz submitted succesfully",
    data: {
      totalMarks,
      earnedMarks,
      correctAnswers: correctAnswersCount,
      incorrectAnswers: incorrectAnswersCount,
      results: quizResults,
    },
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
  sendEnrollRequest,
  getEnrollRequest,
  updateEnrollRequest,
  getMyModules,
  getMyModulesVideos,
  markCompletedVideo,
  getModuleQuiz,
  submitAssignment,
  getAssignmentSubmisson,
  quizSubmit,
};
