// utils/taskReminderService.js
import Todo from "../models/Todo.js";
import sendEmail from "../utils/sendEmail.js";

export const checkUpcomingTasks = async () => {
  try {
    const now = new Date();

    // Define time windows
    const oneHourLater = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    const fiveHoursLater = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1. Check for 24-hour reminders (Due within next 24 hours, but > 5 hours away)
    const tasksFor24h = await Todo.find({
      dueDate: { $gte: now,$lte: twentyFourHoursLater },
      reminder24hSent: false,
      completed: false,
    });

    for (const task of tasksFor24h) {
      // Only fire if it's actually past the 5-hour mark (meaning it's between 5h and 24h away)
      const timeRemaining = new Date(task.dueDate).getTime() - now.getTime();
      if (timeRemaining > 5 * 60 * 60 * 1000) {
        await sendTaskReminder(task, "in about 24 hours");
        task.reminder24hSent = true;
        await task.save();
      }
    }

    // 2. Check for 5-hour reminders (Due within next 5 hours, but > 1 hour away)
    const tasksFor5h = await Todo.find({
      dueDate: { $gte: now,$lte: fiveHoursLater },
      reminder5hSent: false,
      completed: false,
    });

    for (const task of tasksFor5h) {
      const timeRemaining = new Date(task.dueDate).getTime() - now.getTime();
      if (timeRemaining > 1 * 60 * 60 * 1000) {
        await sendTaskReminder(task, "in about 5 hours");
        task.reminder5hSent = true;
        await task.save();
      }
    }

    // 3. Check for 1-hour reminders (Due within next 1 hour)
    const tasksFor1h = await Todo.find({
      dueDate: { $gte: now,$lte: oneHourLater },
      reminder1hSent: false,
      completed: false,
    });

    for (const task of tasksFor1h) {
      await sendTaskReminder(task, "very soon (within 1 hour)");
      task.reminder1hSent = true;
      await task.save();
    }

  } catch (err) {
    console.error("Error running task reminder service:", err);
  }
};

// Helper function to send styled emails
const sendTaskReminder = async (task, urgencyText) => {
  const formattedDate = new Date(task.dueDate).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 30px; color: #334155;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 24px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Task Reminder</h2>
          <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Your task is due ${urgencyText}!</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; margin-top: 0; color: #1e293b;">Hello,</p>
          <p style="font-size: 15px; color: #475569; line-height: 1.5;">
            This is a reminder that you have an upcoming task pending on your Faculty Dashboard.
          </p>

          <!-- Task Card Box -->
          <div style="background: #f1f5f9; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 8px; font-size: 18px; color: #0f172a;">${task.title}</h3>
            ${task.description ? `<p style="margin: 0 0 12px; font-size: 14px; color: #64748b;">${task.description}</p>` : ""}
            <div style="font-size: 13px; font-weight: 600; color: #2563eb;">
              ⏰ Due by: ${formattedDate}
            </div>
          </div>

          <p style="font-size: 14px; color: #64748b; line-height: 1.4; margin-bottom: 30px;">
            Please complete or mark this task as done on your dashboard once finished.
          </p>

          <div style="text-align: center;">
            <a href="http://localhost:3000/faculty/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 2px 5px rgba(37, 99, 235, 0.2);">
              Open Dashboard
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Faculty Portal System. All rights reserved.</p>
        </div>

      </div>
    </div>
  `;

  await sendEmail(task.email, `Reminder: "${task.title}" is due ${urgencyText}!`, emailHtml);
};