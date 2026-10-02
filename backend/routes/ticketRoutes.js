// ✅ routes/ticketRoutes.js
import express from "express";
import { createTicket, getAllTickets, replyTicket, deleteTicket } from "../controllers/ticketController.js";

const router = express.Router();

router.post("/", createTicket);
router.get("/", getAllTickets);
router.patch("/:id/reply", replyTicket);
router.delete("/:id", deleteTicket);

export default router;