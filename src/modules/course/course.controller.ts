import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";

const createCourse = catchAsync(async (req: Request, res: Response) => {
  if (!req.file?.filename) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Course image is required");
  }
  
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course created succesfully",
    data: {},
  });
});
export const CourseController = { createCourse };
