// src/controllers/ticketController.js

import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { hashLookup } from "../utils/fieldCrypto.js"; // 👈 Import hashLookup to query encrypted fields reliably

// POST /api/tickets
export const createTicket = async (req, res) => {
  try {
    const { email, name, idNumber, categoryKey, priority, subject, description } = req.body;

    if (!email || !categoryKey || !subject || !description) {
      return res.status(400).json({ message: "All required ticket details are required." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 🟢 Query using emailHash directly to bypass any middleware lookup translation issues
    const targetEmailHash = hashLookup("email", cleanEmail);
    let userDoc = await User.findOne({ emailHash: targetEmailHash });

    // Fallback: If not found via hash, fetch active users and match decrypted emails manually
    if (!userDoc) {
      const allUsers = await User.find({});
      userDoc = allUsers.find(u => u.email && u.email.toLowerCase() === cleanEmail);
    }

    // Extract accurate values from User database if available
    const finalIdNumber = userDoc ? userDoc.idNumber : (idNumber ? idNumber.trim() : "");
    const finalName = userDoc 
      ? `${userDoc.firstName} ${userDoc.middleName ? userDoc.middleName + " " : ""}${userDoc.lastName}`.trim() 
      : (name ? name.trim() : "Unknown User");

    if (!finalIdNumber) {
      return res.status(400).json({ message: "A valid user ID number could not be found for this email." });
    }

    const newTicket = new Ticket({
      email: cleanEmail,
      name: finalName,
      idNumber: finalIdNumber,
      categoryKey: categoryKey.trim(),
      priority: priority || "Normal",
      subject: subject.trim(),
      description: description.trim(),
    });

    await newTicket.save();

    return res.status(201).json({
      message: "Support ticket submitted successfully.",
      ticket: newTicket.toObject({ getters: true }),
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
    const decryptedTickets = tickets.map((t) => t.toObject({ getters: true }));

    return res.status(200).json(decryptedTickets);
  } catch (err) {
    console.error("getAllTickets error:", err);
    return res.status(500).json({ message: "Failed to fetch tickets." });
  }
};

// PATCH /api/tickets/:id/reply (Reply to user via email & update status)
export const replyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage, status } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

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
          <p>Hello <strong>${ticket.name}</strong>,</p>
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
        ticket.email,
        `Update on your Support Ticket: ${ticket.subject} - ${appName}`,
        emailHtml
      );
    }

    return res.status(200).json({
      message: "Reply sent and ticket updated successfully.",
      ticket: ticket.toObject({ getters: true }),
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