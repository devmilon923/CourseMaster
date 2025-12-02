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

router.get("/guest-details/:courseId", CourseController.courseDetails);
router.get(
  "/details/:courseId",
  guardRole(["admin", "user"]),
  CourseController.courseDetails
);

router.get("/", guardRole(["admin", "user"]), CourseController.getCourses);
router.get("/guest", CourseController.getCourses);
router.post(
  "/enroll-request/:courseId",
  guardRole("user"),
  CourseController.sendEnrollRequest
);
router.get(
  "/enroll-request",
  guardRole(["admin", "user"]),
  CourseController.getEnrollRequest
);

router.patch(
  "/update-request/:requestId",
  guardRole(["admin"]),
  CourseController.updateEnrollRequest
);

router.get(
  "/user/module/:courseId",
  guardRole("user"),
  CourseController.getMyModules
);
router.get(
  "/user/videos/:moduleId",
  guardRole("user"),
  CourseController.getMyModulesVideos
);
router.patch(
  "/video/mark-completed/:videoId",
  guardRole("user"),
  CourseController.markCompletedVideo
);
router.patch(
  "/assignment/mark-completed/:moduleId",
  guardRole("user"),
  CourseController.submitAssignment
);
router.get(
  "/assignment/get/:moduleId",
  guardRole("admin"),
  CourseController.getAssignmentSubmisson
);
router.get(
  "/quiz/:moduleId",
  guardRole(["user", "admin"]),
  CourseController.getModuleQuiz
);

router.post(
  "/quiz-submit/:moduleId",
  guardRole(["user", "admin"]),
  CourseController.quizSubmit
);
export const CourseRouter = router;
