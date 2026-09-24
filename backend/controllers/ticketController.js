// ✅ controllers/ticketController.js
import Ticket from "../models/Ticket.js";
import sendEmail from "../utils/sendEmail.js";

// POST /api/tickets
export const createTicket = async (req, res) => {
  try {
    const { studentEmail, studentName, studentIdNumber, categoryKey, priority, subject, description } = req.body;

    if (!studentEmail || !studentName || !studentIdNumber || !categoryKey || !subject || !description) {
      return res.status(400).json({ message: "All student and ticket details are required." });
    }

    const newTicket = new Ticket({
      studentEmail: studentEmail.trim(),
      studentName: studentName.trim(),
      studentIdNumber: studentIdNumber.trim(),
      categoryKey: categoryKey.trim(),
      priority: priority || "Normal",
      subject: subject.trim(),
      description: description.trim(),
    });

    await newTicket.save();

    return res.status(201).json({
      message: "Support ticket submitted successfully.",
      ticket: newTicket,
    });
  } catch (err) {
    console.error("createTicket error:", err);
    return res.status(500).json({ message: "Failed to submit support ticket." });
  }
};

// GET /api/tickets (Fetch all support tickets)
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    return res.status(200).json(tickets);
  } catch (err) {
    console.error("getAllTickets error:", err);
    return res.status(500).json({ message: "Failed to fetch tickets." });
  }
};

// PATCH /api/tickets/:id/reply (Reply to student via email & update status)
export const replyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage, status } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    // 🛑 Prevent sending emails if the ticket is already marked as Resolved
    if (ticket.status === "Resolved") {
      return res.status(400).json({ 
        message: "This ticket has already been resolved and archived. No further emails can be sent." 
      });
    }

    if (status) {
      ticket.status = status;
    }
    await ticket.save();

    if (replyMessage && replyMessage.trim()) {
      const appName = process.env.APP_NAME || "CampusHub Portal";
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0b4d6b; margin-top: 0;">Response to Your Support Ticket</h2>
          <p>Hello <strong>${ticket.studentName}</strong>,</p>
          <p>An admin has responded to your ticket regarding <em>"${ticket.subject}"</em>:</p>
          <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #0b4d6b; margin: 20px 0; font-size: 15px; line-height: 1.6;">
            ${replyMessage.replace(/\n/g, "<br>")}
          </div>
          <p><strong>Current Ticket Status:</strong> <span style="text-transform: uppercase;">${ticket.status}</span></p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; margin: 0;">
            This is an official communication sent via ${appName}.
          </p>
        </div>
      `;

      await sendEmail(
        ticket.studentEmail,
        `Update on your Support Ticket: ${ticket.subject} - ${appName}`,
        emailHtml
      );
    }

    return res.status(200).json({
      message: "Reply sent and ticket updated successfully.",
      ticket,
    });
  } catch (err) {
    console.error("replyTicket error:", err);
    return res.status(500).json({ message: err.message || "Failed to send reply email." });
  }
};

// DELETE /api/tickets/:id (Delete/Trash a resolved ticket)
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTicket = await Ticket.findByIdAndDelete(id);

    if (!deletedTicket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    return res.status(200).json({ message: "Ticket deleted successfully." });
  } catch (err) {
    console.error("deleteTicket error:", err);
    return res.status(500).json({ message: "Failed to delete ticket." });
  }
};