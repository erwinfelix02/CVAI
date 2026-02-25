import Student from "../models/Student.js";

export const getStudentsCount = async (req, res) => {
  try {
    const total = await Student.countDocuments();
    return res.json({ total });
  } catch (err) {
    console.error("getStudentsCount error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};