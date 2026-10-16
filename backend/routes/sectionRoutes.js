import express from "express";
import Section from "../models/Section.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Schedule from "../models/Schedule.js";
import Student from "../models/Student.js";
import { addLog, getClientIp } from "../utils/logActivity.js";

const router = express.Router();

const getRegistrarForLog = async () => {
  const registrar = await User.findOne({ role: "Registrar" }).select(
    "email role",
  );
  return {
    email: registrar?.email || "unknown",
    role: registrar?.role || "Registrar",
  };
};

const normalizeText = (str) => {
  if (!str) return "";
  return String(str).replace(/\s+/g, "").toUpperCase();
};

const getDepartmentProgramPatterns = async (departmentInput) => {
  if (!departmentInput) return [];

  const cleanDept = departmentInput.replace(/department|dept/gi, "").trim();

  const matchingCourses = await Course.find({
    $or: [
      { department: new RegExp(departmentInput, "i") },
      { department: new RegExp(cleanDept, "i") },
      { code: new RegExp(cleanDept, "i") },
    ],
  }).select("code name");

  const patterns = [
    new RegExp(departmentInput, "i"),
    new RegExp(cleanDept, "i"),
  ];

  matchingCourses.forEach((c) => {
    if (c.code) patterns.push(new RegExp(`^${c.code}$`, "i"));
    if (c.name) patterns.push(new RegExp(c.name, "i"));
  });

  return patterns;
};

// CREATE
router.post("/", async (req, res) => {
  const ip = getClientIp(req);

  try {
    const newCodeNorm = normalizeText(req.body.code);
    const newRoomNorm = normalizeText(req.body.room);

    const allSections = await Section.find({});

    const codeConflict = allSections.find((s) => normalizeText(s.code) === newCodeNorm);
    if (codeConflict) {
      return res.status(400).json({
        message: `Section code "${req.body.code}" already exists.`,
      });
    }

    if (newRoomNorm) {
      const roomConflict = allSections.find((s) => normalizeText(s.room) === newRoomNorm);
      if (roomConflict) {
        return res.status(400).json({
          message: `Room "${req.body.room}" is already assigned to section ${roomConflict.code}.`,
        });
      }
    }

    const created = await Section.create(req.body);
    const registrar = await getRegistrarForLog();

    addLog({
      action: "Section Created",
      user: registrar.email,
      role: registrar.role,
      type: "Data",
      details: `Created section ${created.code} for ${created.program}, Year ${created.yearLevel}`,
      ip,
      status: "success",
    });

    res.status(201).json(created);
  } catch (err) {
    const registrar = await getRegistrarForLog().catch(() => ({
      email: "unknown",
      role: "Registrar",
    }));

    if (err.code === 11000) {
      return res.status(400).json({ message: "Section code or room already exists." });
    }

    addLog({
      action: "Section Creation Error",
      user: registrar.email,
      role: registrar.role,
      type: "System",
      details: err.message || "Failed to create section.",
      ip,
      status: "error",
    });

    res
      .status(500)
      .json({ message: err.message || "Failed to create section." });
  }
});

// READ ALL OR FILTER BY DEPARTMENT / COURSE PROGRAM
router.get("/", async (req, res) => {
  try {
    const { department, program } = req.query;
    const targetDept = department || program;

    let matchStage = {};

    if (targetDept) {
      const patterns = await getDepartmentProgramPatterns(targetDept);
      matchStage.$or = patterns.map((p) => ({$or: [
          { department: p },
          { program: p }
        ]
      }));
    }

    const sectionsWithFaculty = await Section.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      { $sort: { createdAt: -1 } }, {$lookup: {
          from: "schedules",
          let: { sectionRoom: "$room" },
          pipeline: [
            {
              $match: {
                $expr: {$and: [
                    {
                      $eq: [
                        { $toLower: { $trim: { input: "$room" } } },
                        { $toLower: { $trim: { input: "$$sectionRoom" } } },
                      ],
                    },
                    { $eq: ["$status", "Active"] },
                  ],
                },
              },
            },
            { $project: { faculty: 1, room: 1, section: 1 } },
          ],
          as: "matchedSchedules",
        },
      },
      {
        $lookup: {
          from: "students",
          let: { sectionCode: "$code" },
          pipeline: [
            {
              $match: {
                $expr: {$and: [
                    {
                      $eq: [
                        { $toLower: { $trim: { input: "$section" } } },
                        { $toLower: { $trim: { input: "$$sectionCode" } } },
                      ],
                    },
                  ],
                },
              },
            },
            { $project: { _id: 1 } },
          ],
          as: "matchedStudents",
        },
      },
      {
        $addFields: {
          assignedFacultyArray: {
            $filter: {
              input: "$matchedSchedules.faculty",
              as: "f",
              cond: {
                $and: [
                  { $ne: ["$$f", null] },
                  { $ne: [{ $trim: { input: "$$f" } }, ""] },
                  { $ne: [{$toUpper: { $trim: { input: "$$f" } } }, "TBA"] },
                ],
              },
            },
          },
          enrolled: { $size: "$matchedStudents" },
        },
      },
      {
        $addFields: {
          uniqueFaculty: { $setUnion: ["$assignedFacultyArray", []] },
        },
      },
      {
        $project: {
          code: 1,
          yearLevel: 1,
          program: 1,
          department: 1,
          capacity: 1,
          room: 1,
          enrolled: 1,
          createdAt: 1,
          matchedSchedules: 1,
          uniqueFaculty: 1,
          adviser: {
            $cond: [
              { $gt: [{ $size: "$uniqueFaculty" }, 0] },
              {
                $reduce: {
                  input: "$uniqueFaculty",
                  initialValue: "",
                  in: {
                    $cond: [
                      { $eq: ["$$value", ""] }, "$$this",
                      { $concat: ["$$value", ", ", "$$this"] },
                    ],
                  },
                },
              },
              "TBA",
            ],
          },
        },
      },
    ]);

    res.json(sectionsWithFaculty);
  } catch (err) {
    console.error("Error fetching sections:", err);
    res.status(500).json({ message: "Failed to load sections." });
  }
});

// GET ROOMS DERIVED FROM SECTIONS
router.get("/rooms", async (req, res) => {
  try {
    const { department, program } = req.query;
    const targetDept = department || program;

    let matchQuery = {};

    if (targetDept) {
      const patterns = await getDepartmentProgramPatterns(targetDept);
      matchQuery.$or = patterns.map((p) => ({$or: [
          { department: p },
          { program: p }
        ]
      }));
    }

    const roomsFromSections = await Section.aggregate([
      ...(Object.keys(matchQuery).length > 0 ? [{ $match: matchQuery }] : []),
      {
        $lookup: {
          from: "students",
          let: { sectionCode: "$code" },
          pipeline: [
            {
              $match: {
                $expr: {$eq: [
                    { $toLower: { $trim: { input: "$section" } } },
                    { $toLower: { $trim: { input: "$$sectionCode" } } },
                  ],
                },
              },
            },
            { $project: { _id: 1 } },
          ],
          as: "roomStudents",
        },
      },
      {
        $addFields: {
          enrolledCount: { $size: "$roomStudents" },
        },
      },
      {
        $group: {
          _id: { $toUpper: { $trim: { input: "$room" } } },
          originalRoom: { $first: "$room" },
          classes: { $sum: 1 },
          totalCapacity: { $sum: "$capacity" },
          totalEnrolled: { $sum: "$enrolledCount" },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$originalRoom",
          building: { $literal: "Main Building" },
          type: { $literal: "Lecture" },
          seats: {
            $cond: [{$gt: ["$totalCapacity", 0] }, "$totalCapacity", 40],
          },
          classes: 1,
          utilization: {
            $cond: [
              { $gt: ["$totalCapacity", 0] },
              {
                $min: [ 100, {$round: [
                      {
                        $multiply: [
                          { $divide: ["$totalEnrolled", "$totalCapacity"] },
                          100,
                        ],
                      },
                      0,
                    ],
                  },
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.json(roomsFromSections);
  } catch (err) {
    console.error("Error fetching department rooms from sections:", err);
    res.status(500).json({ message: "Failed to fetch rooms for department." });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  const ip = getClientIp(req);

  try {
    const oldSection = await Section.findById(req.params.id);

    if (!oldSection) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Section Update Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: `Section not found. ID: ${req.params.id}`,
        ip,
        status: "warning",
      });

      return res.status(404).json({ message: "Section not found." });
    }

    const otherSections = await Section.find({ _id: { $ne: req.params.id } });

    if (req.body.code) {
      const newCodeNorm = normalizeText(req.body.code);
      const codeConflict = otherSections.find((s) => normalizeText(s.code) === newCodeNorm);
      if (codeConflict) {
        return res.status(400).json({
          message: `Section code "${req.body.code}" already exists.`,
        });
      }
    }

    if (req.body.room) {
      const newRoomNorm = normalizeText(req.body.room);
      const roomConflict = otherSections.find((s) => normalizeText(s.room) === newRoomNorm);
      if (roomConflict) {
        return res.status(400).json({
          message: `Room "${req.body.room}" is already assigned to section ${roomConflict.code}.`,
        });
      }
    }

    const updated = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const registrar = await getRegistrarForLog();

    addLog({
      action: "Section Updated",
      user: registrar.email,
      role: registrar.role,
      type: "Data",
      details: `Updated section ${oldSection.code} -> ${updated.code}`,
      ip,
      status: "success",
    });

    res.json(updated);
  } catch (err) {
    const registrar = await getRegistrarForLog().catch(() => ({
      email: "unknown",
      role: "Registrar",
    }));

    if (err.code === 11000) {
      return res.status(400).json({ message: "Section code or room already exists." });
    }

    addLog({
      action: "Section Update Error",
      user: registrar.email,
      role: registrar.role,
      type: "System",
      details: err.message || "Failed to update section.",
      ip,
      status: "error",
    });

    res
      .status(500)
      .json({ message: err.message || "Failed to update section." });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  const ip = getClientIp(req);

  try {
    const deleted = await Section.findByIdAndDelete(req.params.id);

    if (!deleted) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Section Delete Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: `Section not found. ID: ${req.params.id}`,
        ip,
        status: "warning",
      });

      return res.status(404).json({ message: "Section not found." });
    }

    const registrar = await getRegistrarForLog();

    addLog({
      action: "Section Deleted",
      user: registrar.email,
      role: registrar.role,
      type: "Data",
      details: `Deleted section ${deleted.code} (${deleted.program}, Year ${deleted.yearLevel})`,
      ip,
      status: "success",
    });

    res.json({ message: "Deleted successfully." });
  } catch (err) {
    const registrar = await getRegistrarForLog().catch(() => ({
      email: "unknown",
      role: "Registrar",
    }));

    addLog({
      action: "Section Delete Error",
      user: registrar.email,
      role: registrar.role,
      type: "System",
      details: err.message || "Failed to delete section.",
      ip,
      status: "error",
    });

    res.status(500).json({ message: "Failed to delete section." });
  }
});

export default router;