import cron from "node-cron";
import ArchivedPreregistration from "../models/ArchivedPreregistration.js";
import RegistrarSettings from "../models/RegistrarSettings.js";

export function initArchiveCleanupTask() {
  // Runs every day at midnight (00:00)
  cron.schedule("0 0 * * *", async () => {
    try {
      const settings = await RegistrarSettings.findOne();
      const retentionDays = settings?.archiveRetentionDays ?? 30; // fallback to 30 days

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Delete items archived before the cutoff date
      const result = await ArchivedPreregistration.deleteMany({
        archivedAt: { $lt: cutoffDate },
      });

      console.log(
        `[Archive Cleanup] Deleted ${result.deletedCount} items archived before ${cutoffDate.toISOString()} (${retentionDays} days retention).`
      );
    } catch (error) {
      console.error("[Archive Cleanup Error]:", error);
    }
  });
}