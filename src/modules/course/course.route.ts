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

router.post(
  "/add-module/:courseId",
  guardRole("admin"),
  CourseController.addModule
);

router.post(
  "/add-video/:moduleId",
  guardRole("admin"),
  CourseController.addVideo
);
router.post(
  "/add-quiz/:moduleId",
  guardRole("admin"),
  CourseController.addQuiz
);

router.patch(
  "/update/:courseId",
  guardRole("admin"),
  upload.single("image"),
  CourseController.updateCourse
);

router.patch(
  "/details/:courseId",
  guardRole("admin"),
  CourseController.courseDetails
);

router.get("/", guardRole(["admin", "user"]), CourseController.getCourses);
export const CourseRouter = router;
