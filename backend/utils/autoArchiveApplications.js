import Preregistration from "../models/Preregistration.js";
import ArchivedPreregistration from "../models/ArchivedPreregistration.js";

function subtractDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

export async function autoArchiveApplications() {
  try {
    const cutoffDate = subtractDays(new Date(), 5);

    const appsToArchive = await Preregistration.find({
      $or: [
        {
          status: "Rejected",
          rejectedAt: { $ne: null, $lte: cutoffDate },
        },
        {
          status: "Approved",
          scheduleSentAt: { $ne: null, $lte: cutoffDate },
        },
      ],
    });

    if (!appsToArchive.length) {
      console.log("[auto-archive] No applications to archive.");
      return;
    }

    for (const app of appsToArchive) {
      const plain = app.toObject();

      const archivedDoc = new ArchivedPreregistration({
        ...plain,
        _id: undefined,
        status: "Archived",
        originalStatus: plain.status,
        archivedAt: new Date(),
      });

      await archivedDoc.save();
      await Preregistration.deleteOne({ registrationId: app.registrationId });
    }

    console.log(
      `[auto-archive] Archived ${appsToArchive.length} application(s).`,
    );
  } catch (err) {
    console.error("[auto-archive] Error:", err);
  }
}