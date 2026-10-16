// backend/controllers/auditController.js

import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = {};

    if (department && department !== "All" && department !== "undefined") {
      filter.department = { $regex: new RegExp(`^${String(department).trim()}$`, "i") };
    }

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json(logs);
  } catch (err) {
    console.error("getAuditLogs error:", err);
    return res.status(500).json({ message: "Server error fetching audit logs." });
  }
};

export const createAuditLog = async (req, res) => {
  try {
    const { department, student, fromSection, toSection, assignedBy, assignedAt } = req.body;

    if (!student || !toSection || !assignedBy) {
      return res.status(400).json({ message: "Missing required audit log fields." });
    }

    const newLog = new AuditLog({
      department: department || "General Department",
      student,
      fromSection: fromSection || "—",
      toSection,
      assignedBy,
      assignedAt: assignedAt || new Date().toLocaleString(),
    });

    const savedLog = await newLog.save();
    return res.status(201).json({ success: true, log: savedLog });
  } catch (err) {
    console.error("createAuditLog error:", err);
    return res.status(500).json({ message: "Server error saving audit log." });
  }
};