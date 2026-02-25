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
import accountRoutes from "./routes/accountRoutes.js";
import registrarSettingsRoutes from "./routes/registrarSettingsRoutes.js";
const app = express();

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
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);


connectDB();
app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/faqs", faqRoutes);
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

app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000"),
);
