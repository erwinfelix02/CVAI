import SchoolMember from "../models/SchoolMember.js";
import User from "../models/User.js";

// Add a new user
export const addUser = async (req, res) => {
  try {
    const { fullName, idNumber, role, courseOrDept, yearOrPosition } = req.body;

    if (!fullName || !idNumber || !role || !courseOrDept || !yearOrPosition) {
      return res.status(400).json({ message: "All fields are required", body: req.body });
    }

    const existingUser = await SchoolMember.findOne({ schoolId: idNumber });
    if (existingUser) {
      return res.status(400).json({ message: "ID number already exists" });
    }

    const newUser = new SchoolMember({
      fullName,
      schoolId: idNumber,
      role,
      courseOrDept,
      yearOrPosition,
      status: "inactive",
    });

    await newUser.save();
    return res.status(201).json({ message: "User added successfully", user: newUser });

  } catch (error) {
    console.error("AddUser Error:", error);

    if (error.code === 11000) {
      // Duplicate key error (unique index violation)
      return res.status(400).json({ message: "ID number already exists" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};


// Get all users
export const getUsers = async (req, res) => {
  try {
    const members = await SchoolMember.find();

    const users = await Promise.all(
      members.map(async (member) => {
        const user = await User.findOne({ schoolId: member.schoolId });
        return {
          id: member.schoolId,
          name: member.fullName,
          role: member.role,
          status: member.status,
          courseOrDept: member.courseOrDept,
          yearOrPosition: member.yearOrPosition,
          email: user?.email || "No account created", // include email if exists
        };
      })
    );

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
