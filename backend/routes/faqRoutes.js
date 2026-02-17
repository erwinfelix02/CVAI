import express from "express";
import Faq from "../models/Faq.js";

const router = express.Router();

// Get FAQs with filtering
router.get("/", async (req, res) => {
  const { category, role } = req.query;

  const filter = {};

  if (category) filter.category = category;
  if (role) filter.role_visibility = { $in: [role] };

  const faqs = await Faq.find(filter).sort({ createdAt: -1 });

  res.json(faqs);
});

// Create FAQ
router.post("/", async (req, res) => {
  const faq = await Faq.create(req.body);
  res.json(faq);
});

// Update FAQ
router.put("/:id", async (req, res) => {
  const faq = await Faq.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(faq);
});

// Delete FAQ
router.delete("/:id", async (req, res) => {
  await Faq.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
