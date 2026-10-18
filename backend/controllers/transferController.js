import TransferRequest from "../models/TransferRequest.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import validator from "validator";
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
      requestType: "transfer",
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

export const createDropRequestRecord = async (studentId, reason) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) return;

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
    const { updatedBy } = req.body;
    
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
      student.program = "Dropped";
      student.department = "Unassigned"; // Automatically removes/clears the department
      await student.save();

      // Locate and deactivate User portal account so they cannot sign in
      const userAccount = await User.findOne({
        $or: [
          { email: student.email },
          { idNumber: student.studentIdNumber }
        ]
      });

      if (userAccount) {
        userAccount.status = "inactive";
        userAccount.department = "Unassigned";
        await userAccount.save();
      }

      // Send official drop email notification
      const studentEmail = student.email || userAccount?.email;
      if (studentEmail) {
        const studentFullName = student.fullName || userAccount?.firstName || "Student";
        const appName = process.env.APP_NAME || "CVAI Portal";
        const reasonText = transferReq.reason || "Official Drop Request Approved by Registrar.";

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #dc2626; margin-top: 0;">Official Notice of Enrollment: Dropped</h2>
            <p>Hello <strong>${studentFullName}</strong>,</p>
            <p>Your official drop request has been approved by ${updatedBy || "the Registrar Office"}. Your student portal account has been deactivated.</p>
            <p><strong>Reason / Remarks:</strong></p>
            <blockquote style="background: #f8fafc; border-left: 4px solid #dc2626; margin: 0 0 16px 0; padding: 12px; font-style: italic;">
              "${validator.escape(String(reasonText))}"
            </blockquote>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b; margin: 0;">
              This is an official automated notification sent via ${appName}. Please do not reply directly to this email.
            </p>
          </div>
        `;

        await sendEmail(studentEmail, `Enrollment Status Update: Officially Dropped - ${appName}`, emailHtml).catch((mailErr) => {
          console.error("Failed to dispatch drop notification email:", mailErr);
        });
      }
    } else {
      student.program = transferReq.targetCourse;
      student.department = transferReq.targetDepartment;
      student.workflowState = "None";
      await student.save();
    }
    
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