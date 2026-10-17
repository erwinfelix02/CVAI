// backend/controllers/transferController.js

import TransferRequest from "../models/TransferRequest.js";
import Student from "../models/Student.js";
import mongoose from "mongoose";

export const createTransferRequest = async (req, res) => {
  try {
    const { studentId, transferType, targetCourse, targetDepartment, reason } = req.body;

    const student = await Student.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(studentId) ? studentId : null },
        { studentIdNumber: studentId },
      ],
    });

    if (!student) {
      return res.status(404).json({ error: "Student record not found" });
    }

    if (student.workflowState === "Transfer Pending") {
      return res.status(400).json({
        error: "This student already has a pending program transfer request in progress.",
      });
    }

    const transferRequest = new TransferRequest({
      student: student._id,
      requestType: "transfer", // 👈 Explicit request type
      transferType,
      currentDepartment: student.department || "",
      currentCourse: student.program || student.course || "",
      targetDepartment: transferType === "external" ? targetDepartment : student.department,
      targetCourse: targetCourse || "",
      reason: reason || "Department Head initiated program transfer request.",
      status: "Pending",
    });

    await transferRequest.save();

    student.workflowState = "Transfer Pending";
    student.section = ""; 
    student.assignedAt = "—";
    await student.save();

    return res.status(201).json({
      message: "Transfer request submitted successfully",
      transferRequest: transferRequest.toJSON(),
    });
  } catch (error) {
    console.error("❌ Error creating transfer request stack:", error);
    return res.status(500).json({ error: error.message || "Server error while processing transfer request" });
  }
};

// 🟢 NEW: Create Drop Request entry
export const createDropRequestRecord = async (studentId, reason) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) return;

    // Check if an active drop request already exists
    const existing = await TransferRequest.findOne({ student: student._id, requestType: "drop", status: "Pending" });
    if (existing) return;

    const dropRequest = new TransferRequest({
      student: student._id,
      requestType: "drop",
      transferType: "internal",
      currentDepartment: student.department || "",
      currentCourse: student.program || student.course || "",
      targetDepartment: student.department || "",
      targetCourse: "Official Drop / Unassigned",
      reason: reason || "No reason provided.",
      status: "Pending",
    });

    await dropRequest.save();
  } catch (err) {
    console.error("Error logging drop request history:", err);
  }
};

export const getTransferRequests = async (req, res) => {
  try {
    const requests = await TransferRequest.find()
      .populate({
        path: "student",
        select: "fullName studentIdNumber program department status workflowState email phone"
      })
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map((req) => {
      const plainReq = req.toJSON();
      
      const studentDoc = req.student;
      if (studentDoc) {
        plainReq.studentName = studentDoc.fullName || studentDoc.name || "Unknown Student";
        plainReq.studentId = studentDoc.studentIdNumber || studentDoc.id || "";
      } else {
        plainReq.studentName = "Unknown Student";
        plainReq.studentId = "";
      }

      return plainReq;
    });

    return res.status(200).json(formattedRequests);
  } catch (error) {
    console.error("Error fetching transfer requests:", error);
    return res.status(500).json({ error: "Server error while fetching transfer requests" });
  }
};

export const approveTransferRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const transferReq = await TransferRequest.findById(id).populate("student");

    if (!transferReq) {
      return res.status(404).json({ error: "Request not found." });
    }

    const student = await Student.findById(transferReq.student._id || transferReq.student);
    if (!student) {
      return res.status(404).json({ error: "Associated student record not found." });
    }

    if (transferReq.requestType === "drop") {
      student.status = "Dropped";
      student.workflowState = "None";
      student.section = "";
    } else {
      student.program = transferReq.targetCourse;
      student.department = transferReq.targetDepartment;
      student.workflowState = "None";
    }
    
    await student.save();

    transferReq.status = "Approved";
    await transferReq.save();

    return res.status(200).json({
      message: "Request approved and student record updated successfully.",
      student,
    });
  } catch (error) {
    console.error("approveTransferRequest error:", error);
    return res.status(500).json({ error: "Server error while approving request." });
  }
};

export const returnTransferRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const transferReq = await TransferRequest.findById(id);

    if (!transferReq) {
      return res.status(404).json({ error: "Request not found." });
    }

    await Student.findByIdAndUpdate(transferReq.student, { workflowState: "None" });

    transferReq.status = "Returned";
    await transferReq.save();

    return res.status(200).json({ message: "Request returned successfully." });
  } catch (error) {
    console.error("returnTransferRequest error:", error);
    return res.status(500).json({ error: "Server error while returning request." });
  }
};