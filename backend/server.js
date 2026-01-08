import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import emailVerificationRoutes from "./routes/emailVerification.routes.js";
import resendCodeRoutes from "./routes/resendCode.js";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", emailVerificationRoutes);
app.use("/api/auth", resendCodeRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(5000, () => console.log("🚀 Server on port 5000"));
