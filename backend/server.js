import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import connectDB from "./config/db.js";



const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(5000, () => console.log("🚀 Server on port 5000"));
