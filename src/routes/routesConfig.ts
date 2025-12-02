import { UserRoutes } from "../modules/user/user.route";
import { TermsRoutes } from "../modules/settings/Terms/Terms.route";
import { AboutRoutes } from "../modules/settings/About/About.route";
import { PrivacyRoutes } from "../modules/settings/privacy/Privacy.route";
import { NotificationRoutes } from "../modules/notifications/notification.route";
import { SupportRoutes } from "../modules/support/support.route";
import {
  AppInstruction,
  htmlRoute,
} from "../modules/settings/privacy/Privacy.controller";
import { AdminRoutes } from "../modules/admin/admin.route";
import { CourseRouter } from "../modules/course/course.route";

export const routesConfig = [
  { path: "/api/v1/auth", handler: UserRoutes },
  { path: "/api/v1/terms", handler: TermsRoutes },
  { path: "/api/v1/about", handler: AboutRoutes },
  { path: "/api/v1/privacy", handler: PrivacyRoutes },
  { path: "/api/v1/notification", handler: NotificationRoutes },
  { path: "/api/v1/support", handler: SupportRoutes },
  { path: "/api/v1/admin", handler: AdminRoutes },
  { path: "/api/v1/course", handler: CourseRouter },
  //------>publishing app <--------------
  { path: "/privacy-policy-page", handler: htmlRoute },
  { path: "/app-instruction", handler: AppInstruction },
];
