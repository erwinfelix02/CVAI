// routes/sectionRequests.js
import express from "express";
import SectionRequest from "../models/SectionRequest.js";
import Section from "../models/Section.js";

const router = express.Router();

// Helper to normalize text for comparison (removes spaces and converts to uppercase)
const normalizeText = (str) => {
  if (!str) return "";
  return String(str).replace(/\s+/g, "").toUpperCase();
};

// GET all section requests
router.get("/", async (req, res) => {
  try {
    const { department } = req.query;
    const filter = department ? { department } : {};
    let requests = await SectionRequest.find(filter).sort({ createdAt: -1 });

    if (requests.length === 0 && !department) {
      requests = [
        {
          _id: "sample_req_1",
          department: "College of Information Technology",
          program: "BSIT",
          yearLevel: 2,
          sectionName: "BSIT 2C",
          requestedCapacity: 45,
          preferredRoom: "Room 301",
          reason: "Surge in second-year student enrollments and transferees.",
          status: "Pending",
          createdAt: new Date(),
        },
      ];
    }

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch requests error:", err);
    res.status(500).json({ message: "Server error fetching section requests" });
  }
});

// POST create a new section request with duplicate section name & room collision checks
router.post("/", async (req, res) => {
  try {
    const { department, program, yearLevel, sectionName, requestedCapacity, preferredRoom, reason, requestedBy } = req.body;

    if (!department || !program || !sectionName || !preferredRoom || !reason || !yearLevel) {
      return res.status(400).json({ 
        message: "Please fill in all required fields including department, program, year level, section name, preferred room, and reason." 
      });
    }

    const normalizedSectionName = normalizeText(sectionName);
    const normalizedPreferredRoom = normalizeText(preferredRoom);

    const existingSections = await Section.find({});
    
    const sectionNameConflict = existingSections.find(
      (s) => normalizeText(s.code) === normalizedSectionName
    );

    if (sectionNameConflict) {
      return res.status(400).json({ 
        message: `A section with the name "${sectionName}" already exists in the active system records.` 
      });
    }

    const roomConflict = existingSections.find(
      (s) => normalizeText(s.room) === normalizedPreferredRoom
    );

    if (roomConflict) {
      return res.status(400).json({ 
        message: `The preferred room "${preferredRoom}" is already assigned to active section "${roomConflict.code}". You cannot request a section with a duplicate room.` 
      });
    }

    const existingRequests = await SectionRequest.find({ status: "Pending" });
    
    const requestNameConflict = existingRequests.find(
      (r) => normalizeText(r.sectionName) === normalizedSectionName
    );

    if (requestNameConflict) {
      return res.status(400).json({ 
        message: `A pending request for section name "${sectionName}" has already been submitted.` 
      });
    }

    const requestRoomConflict = existingRequests.find(
      (r) => normalizeText(r.preferredRoom) === normalizedPreferredRoom
    );

    if (requestRoomConflict) {
      return res.status(400).json({ 
        message: `A pending request for preferred room "${preferredRoom}" has already been submitted (Section: ${requestRoomConflict.sectionName}).` 
      });
    }

    const newRequest = new SectionRequest({
      department,
      program,
      yearLevel: yearLevel || 1,
      sectionName: sectionName.trim(),
      requestedCapacity: requestedCapacity || 40,
      preferredRoom: preferredRoom.trim(),
      reason: reason.trim(),
      status: "Pending",
      requestedBy: requestedBy || null,
    });

    await newRequest.save();
    res.status(201).json({ message: "Section request submitted successfully to the Registrar.", request: newRequest });
  } catch (err) {
    console.error("Create request error:", err);
    res.status(500).json({ message: "Server error submitting section request" });
  }
});

// PATCH approve a section request (converts it into an active Section and marks request Approved)
router.patch("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { room } = req.body; // Registrar can override room upon approval if needed

    const request = await SectionRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Section request not found." });
    }

    if (request.status === "Approved") {
      return res.status(400).json({ message: "This request has already been approved." });
    }

    // Create the active section from the request data
    const finalRoom = room || request.preferredRoom;
    const newSection = new Section({
      code: request.sectionName,
      program: request.program,
      department: request.department,
      yearLevel: request.yearLevel,
      capacity: request.requestedCapacity,
      room: finalRoom,
      enrolled: 0,
    });

    await newSection.save();

    // Update request status to Approved
    request.status = "Approved";
    await request.save();

    res.status(200).json({ message: "Section request approved and section created successfully.", section: newSection });
  } catch (err) {
    console.error("Approve request error:", err);
    res.status(500).json({ message: "Server error approving section request" });
  }
});

// PATCH reject/return a section request with feedback
router.patch("/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const request = await SectionRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Section request not found." });
    }

    request.status = "Rejected";
    if (feedback) {
      request.reason = `${request.reason} | Registrar Feedback: ${feedback}`;
    }
    
    await request.save();

    res.status(200).json({ message: "Section request returned successfully.", request });
  } catch (err) {
    console.error("Reject request error:", err);
    res.status(500).json({ message: "Server error returning section request" });
  }
});

// DELETE a section request by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const request = await SectionRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Section request not found." });
    }

    // Optional safety check: Prevent deleting Pending requests via API as well
    if (request.status === "Pending") {
      return res.status(400).json({ message: "Pending section requests cannot be deleted." });
    }

    await SectionRequest.findByIdAndDelete(id);

    res.status(200).json({ message: "Section request deleted successfully." });
  } catch (err) {
    console.error("Delete request error:", err);
    res.status(500).json({ message: "Server error deleting section request" });
  }
});


export default router;