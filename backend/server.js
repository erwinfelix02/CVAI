import dotenv from "dotenv";
dotenv.config();
import path from "path";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import helmet from "helmet";
import faqRoutes from "./routes/faqRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import preregistrationRoutes from "./routes/preregistration.js";
import enrollmentsRoute from "./routes/enrollments.js";
import aiInsightRoutes from "./routes/aiInsightRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import registrarSettingsRoutes from "./routes/registrarSettingsRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import { seedRolesIfMissing } from "./utils/seedRoles.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import securitySettingsRoutes from "./routes/securitySettingsRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import { startArchiveScheduler } from "./jobs/archiveScheduler.js";
import roomRoutes from "./routes/roomRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import { initArchiveCleanupTask } from "./utils/archiveCleanup.js";
import announcementsRouter from "./routes/announcements.js";

const app = express();

initArchiveCleanupTask();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res, path) => {
      res.setHeader("Content-Disposition", "inline");

      if (path.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
      }

      if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
        res.setHeader("Content-Type", "image/jpeg");
      }

      if (path.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      }
    },
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  }),
);

// ✅ Start server only after DB is connected
const startServer = async () => {
  try {
    await connectDB(); // ✅ wait for mongo connect
    await seedRolesIfMissing(); // ✅ seed after connect
     await startArchiveScheduler();

    app.use("/uploads", express.static("uploads"));
    app.use("/api/users", userRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/faqs", faqRoutes);
    app.use("/api/subjects", subjectRoutes);
    app.use("/api/ai", aiRoutes);
    app.use("/api/preregistrations", preregistrationRoutes);
    app.use("/api/enrollments", enrollmentsRoute);
    app.use("/api/aiinsight", aiInsightRoutes);
    app.use("/api/enrollment", enrollmentRoutes);
    app.use("/api/sections", sectionRoutes);
    app.use("/api/courses", courseRoutes);
    app.use("/api/students", studentRoutes);
    app.use("/api/accounts", accountRoutes);
    app.use("/api/registrar/settings", registrarSettingsRoutes);
    app.use("/api/settings", settingsRoutes);
    app.use("/api/security-settings", securitySettingsRoutes);
    app.use("/api/rooms", roomRoutes);
    app.use("/api/roles", roleRoutes);
    app.use("/api/materials", materialRoutes);
    app.use("/api/departments", departmentRoutes);
    app.use("/api/schedules", scheduleRoutes);
    app.use("/api/logs", logRoutes);
    app.use("/api/announcements", announcementsRouter);
    
    app.listen(5000, () => {
      console.log("🚀 Server running on http://localhost:5000");
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

startServer();
