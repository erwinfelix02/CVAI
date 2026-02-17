import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import helmet from "helmet";
import faqRoutes from "./routes/faqRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);


app.use("/api/faqs", faqRoutes);
app.use("/api/ai", aiRoutes);

app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000"),
);
