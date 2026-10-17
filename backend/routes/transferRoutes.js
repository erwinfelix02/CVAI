// ✅ routes/transferRoutes.js
import express from "express";
import {
  createTransferRequest,
  getTransferRequests,
  approveTransferRequest,
  returnTransferRequest,
} from "../controllers/transferController.js";

const router = express.Router();

router.route("/").post(createTransferRequest).get(getTransferRequests);
router.patch("/:id/approve", approveTransferRequest);
router.patch("/:id/return", returnTransferRequest);

export default router;