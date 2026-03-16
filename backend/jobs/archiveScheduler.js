import cron from "node-cron";
import { autoArchiveApplications } from "../utils/autoArchiveApplications.js";

export async function startArchiveScheduler() {
  console.log("[auto-archive] Running startup archive check...");
  await autoArchiveApplications();

  cron.schedule("0 1 * * *", async () => {
    console.log("[auto-archive] Running scheduled archive job...");
    await autoArchiveApplications();
  });

  console.log("[auto-archive] Scheduler started.");
}