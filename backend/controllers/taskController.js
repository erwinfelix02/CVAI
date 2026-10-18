// ✅ controllers/taskController.js
import Task from "../models/Task.js";
import sendEmail from "../utils/sendEmail.js";
import { addLog, getClientIp } from "../utils/logActivity.js";

// Helper to extract user identity from headers or body
const getUserInfo = (req) => {
  const userId = req.headers["x-user-id"] || req.body.userId || "65a1234567890abcdef12345";
  const userEmail = req.headers["x-user-email"] || req.body.email || "student@example.com";
  return { userId, userEmail };
};

// Background or pre-fetch check for email reminders
const checkAndNotifyUpcomingTasks = async (userId, userEmail, req) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const upcomingTasks = await Task.find({
      userId,
      dateKey: todayStr,
      completed: false,
      notified: false,
    });

    const appName = process.env.APP_NAME || "CVAI Portal";
    
    // Use environment variable if set, otherwise fallback to your deployed public IP
    const frontendUrl = process.env.FRONTEND_URL || "http://32.237.52.114";
    const portalUrl = `${frontendUrl}/signin`;

    for (const task of upcomingTasks) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f766e; margin-top: 0;">Task Reminder</h2>
          <p>Hello,</p>
          <p>This is a reminder that you have a task due today:</p>
          <blockquote style="background: #f8f9fa; padding: 12px 15px; border-left: 4px solid #0f766e; margin: 15px 0;">
            <strong>${task.text}</strong><br/>
            <small style="color: #64748b;">Due Date: ${new Date(task.dueDate).toLocaleDateString()}</small>
          </blockquote>
          
          <!-- Clickable Login CTA Button -->
          <div style="text-align: center; margin: 25px 0;">
            <a href="${portalUrl}" style="display: inline-block; padding: 12px 28px; background-color: #0f766e; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">
              Sign In to View Portal
            </a>
          </div>

          <p>Please log in to your student portal to complete it.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; margin: 0;">
            This is an official automated notification sent via ${appName}. Please do not reply directly to this email.
          </p>
        </div>
      `;

      await sendEmail(
        userEmail,
        `Reminder: Upcoming Task Due Today - ${appName}`,
        emailHtml
      );

      task.notified = true;
      await task.save();

      addLog({
        action: "Send Task Reminder Email",
        user: userEmail,
        role: "Student",
        type: "Security",
        details: `Reminder email sent for task: "${task.text}"`,
        ip: getClientIp(req),
        status: "success",
      });
    }
  } catch (error) {
    console.error("Failed to send task reminder email:", error);
  }
};

export const getTasks = async (req, res) => {
  try {
    const { userId, userEmail } = getUserInfo(req);

    // Check & trigger email reminders if due today
    await checkAndNotifyUpcomingTasks(userId, userEmail, req);

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({ message: "Server error fetching tasks", error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { dateKey, text, dueDate } = req.body;
    const { userId, userEmail } = getUserInfo(req);

    if (!dateKey || !text) {
      return res.status(400).json({ message: "Date and task text are required." });
    }

    const task = new Task({
      userId,
      email: userEmail,
      dateKey,
      dueDate: dueDate || new Date(dateKey),
      text,
    });

    await task.save();

    // If task is created for today, trigger reminder email immediately
    const todayStr = new Date().toISOString().split("T")[0];
    if (dateKey === todayStr) {
      const appName = process.env.APP_NAME || "CVAI Portal";
      
      // Use environment variable if set, otherwise fallback to your deployed public IP
      const frontendUrl = process.env.FRONTEND_URL || "http://32.237.52.114";
      const portalUrl = `${frontendUrl}/signin`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f766e; margin-top: 0;">Task Reminder</h2>
          <p>Hello,</p>
          <p>You have successfully scheduled a task due today:</p>
          <blockquote style="background: #f8f9fa; padding: 12px 15px; border-left: 4px solid #0f766e; margin: 15px 0;">
            <strong>${text}</strong><br/>
            <small style="color: #64748b;">Due Date: ${new Date(task.dueDate).toLocaleDateString()}</small>
          </blockquote>

          <!-- Clickable Login CTA Button -->
          <div style="text-align: center; margin: 25px 0;">
            <a href="${portalUrl}" style="display: inline-block; padding: 12px 28px; background-color: #0f766e; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">
              Sign In to View Portal
            </a>
          </div>

          <p>Please log in to your student portal to complete it.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; margin: 0;">
            This is an official automated notification sent via ${appName}. Please do not reply directly to this email.
          </p>
        </div>
      `;

      await sendEmail(
        userEmail,
        `Reminder: Task Due Today - ${appName}`,
        emailHtml
      );

      task.notified = true;
      await task.save();
    }

    addLog({
      action: "Create Task",
      user: userEmail,
      role: "Student",
      type: "Data",
      details: `Task created for date ${dateKey}`,
      ip: getClientIp(req),
      status: "success",
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ message: "Server error creating task", error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, text } = req.body;
    const { userId, userEmail } = getUserInfo(req);

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (completed !== undefined) task.completed = completed;
    if (text !== undefined) task.text = text;

    await task.save();

    addLog({
      action: "Update Task",
      user: userEmail,
      role: "Student",
      type: "Data",
      details: `Task ${id} updated`,
      ip: getClientIp(req),
      status: "success",
    });

    return res.status(200).json(task);
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ message: "Server error updating task", error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userEmail } = getUserInfo(req);

    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    addLog({
      action: "Delete Task",
      user: userEmail,
      role: "Student",
      type: "Data",
      details: `Task ${id} deleted`,
      ip: getClientIp(req),
      status: "success",
    });

    return res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ message: "Server error deleting task", error: error.message });
  }
}; 