import { Router } from "express";
import { guardRole } from "../../middlewares/roleGuard";
import { CourseController } from "./course.controller";
import upload from "../../multer/multer";

const router = Router();
router.post(
  "/create",
  guardRole("admin"),
  upload.single("image"),
  CourseController.createCourse
);
export const CourseRouter = router;
