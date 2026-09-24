// routes/todoRoutes.js
import express from "express";
import Todo from "../models/Todo.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const todos = await Todo.find({ email }).sort({ dueDate: 1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch todos." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { email, role, title, description, date, time } = req.body;
    if (!email || !title || !date) {
      return res.status(400).json({ message: "Email, title, and date are required." });
    }

    // Combine separate date ("YYYY-MM-DD") and time ("HH:mm") into a single ISO Date
    const timeString = time ? time : "23:59";
    const combinedDateTime = new Date(`${date}T${timeString}:00`);

    const newTodo = await Todo.create({
      email,
      role: role || "Faculty",
      title,
      description,
      dueDate: combinedDateTime,
    });

    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ message: "Failed to create todo." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Todo.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Todo not found." });
    res.json({ message: "Todo deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete todo." });
  }
});


// routes/todoRoutes.js (PUT Update Route update)
router.put("/:id", async (req, res) => {
  try {
    const { title, description, date, time } = req.body;
    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required." });
    }

    const timeString = time ? time : "23:59";
    const combinedDateTime = new Date(`${date}T${timeString}:00`);

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        dueDate: combinedDateTime,
        emailSent: false, // 🟢 Reset so user gets an alert for the newly updated time
      },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found." });
    }

    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ message: "Failed to update todo." });
  }
});

// PATCH: Mark a todo as completed and remove it from active tasks
router.patch("/:id/complete", async (req, res) => {
  try {
    const completedTodo = await Todo.findByIdAndDelete(req.params.id);
    
    if (!completedTodo) {
      return res.status(404).json({ message: "Todo not found." });
    }

    res.json({ message: "Task marked as done and removed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete todo." });
  }
});

export default router;