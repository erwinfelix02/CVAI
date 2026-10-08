import NodeCache from "node-cache";
import Preregistration from "../models/Preregistration.js";

const insightsCache = new NodeCache({ stdTTL: 60 });
const PYTHON_MODEL_URL = process.env.PYTHON_MODEL_URL || "http://localhost:8000";

function daysBetween(dateA, dateB) {
  const ms = Math.abs(new Date(dateB).getTime() - new Date(dateA).getTime());
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function workloadLabel(pendingCount) {
  if (pendingCount <= 10) return "Low";
  if (pendingCount <= 30) return "Medium";
  return "High";
}

async function getDecryptedPendingApps(limit) {
  const docs = await Preregistration.find({ status: "Pending" })
    .select("status createdAt registrationId personal.firstName personal.lastName personal.email personal.phone personal.address academic.course")
    .sort({ createdAt: -1 })
    .limit(limit);

  return docs.map((doc) => doc.toObject({ getters: true }));
}

function normalizeName(first = "", last = "") {
  return `${first} ${last}`.toLowerCase().replace(/\s+/g, " ").trim();
}

function isSuspiciousEmail(email = "") {
  const e = String(email || "").toLowerCase().trim();
  return e.includes("test") || e.includes("fake") || e.includes("asdf") || e.includes("tempmail");
}

function isSuspiciousPhone(phone = "") {
  const p = String(phone || "").replace(/\D/g, "");
  return !/^09\d{9}$/.test(p) && !/^639\d{9}$/.test(p);
}

// Compute signals and query trained model microservice
async function computeTrainedModelSignals(apps) {
  const nameCount = new Map();
  for (const a of apps) {
    const name = normalizeName(a?.personal?.firstName, a?.personal?.lastName);
    if (name) nameCount.set(name, (nameCount.get(name) || 0) + 1);
  }

  let scamCount = 0;
  const flagged = [];

  for (const a of apps) {
    const email = a?.personal?.email?.toLowerCase()?.trim() || "";
    const phone = a?.personal?.phone?.trim() || "";
    const name = normalizeName(a?.personal?.firstName, a?.personal?.lastName);
    
    const daysPending = a.createdAt ? daysBetween(a.createdAt, new Date()) : 0;
    const dupNameCount = name ? nameCount.get(name) : 1;
    const susPhone = isSuspiciousPhone(phone) ? 1 : 0;
    const susEmail = isSuspiciousEmail(email) ? 1 : 0;

    let isFlaggedByModel = false;
    let modelScore = 0;

    try {
      // Call trained model microservice
      const response = await fetch(`${PYTHON_MODEL_URL}/predict-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daysPending,
          suspiciousPhone: susPhone,
          suspiciousEmail: susEmail,
          duplicateNameCount: dupNameCount,
        }),
      });
      const result = await response.json();
      isFlaggedByModel = result.isFlagged;
      modelScore = Math.round(result.riskScore * 100);
    } catch (err) {
      // Fallback rule evaluation if Python service is offline
      modelScore = (susPhone * 2) + (susEmail ? 1 : 0) + (dupNameCount > 1 ? 2 : 0);
      isFlaggedByModel = modelScore >= 2;
    }

    if (isFlaggedByModel) {
      scamCount++;
      flagged.push({
        registrationId: a.registrationId,
        createdAt: a.createdAt,
        name: `${a?.personal?.firstName ?? ""} ${a?.personal?.lastName ?? ""}`.trim(),
        email: a?.personal?.email,
        phone: a?.personal?.phone,
        address: a?.personal?.address,
        course: a?.academic?.course,
        score: modelScore,
        reasons: [
          dupNameCount > 1 ? "Duplicate name match (Trained Model flag)" : null,
          susEmail ? "Disposable or test email domain" : null,
          susPhone ? "Incorrect phone number prefix/length" : null,
        ].filter(Boolean),
      });
    }
  }

  flagged.sort((a, b) => b.score - a.score);
  return { scamCount, flagged };
}

export async function getRegistrarInsights(_req, res) {
  try {
    const cached = insightsCache.get("registrar-insights-trained");
    if (cached) return res.json(cached);

    const pendingApps = await getDecryptedPendingApps(60);
    const pendingCount = pendingApps.length;

    let oldestPendingDays = 0;
    if (pendingApps.length) {
      const oldestMs = pendingApps.reduce((min, a) => {
        const d = new Date(a.createdAt).getTime();
        return d < min ? d : min;
      }, new Date(pendingApps[0].createdAt).getTime());
      oldestPendingDays = daysBetween(oldestMs, new Date());
    }

    const scam = await computeTrainedModelSignals(pendingApps);
    const load = workloadLabel(pendingCount);

    const data = {
      insights: [
        {
          key: "scam",
          label: "Suspicious registrations",
          value: String(scam.scamCount),
          hint: "Classified using trained classification model.",
        },
        {
          key: "oldest",
          label: "Oldest pending",
          value: `${oldestPendingDays} days`,
          hint: "Clear out legacy backlog items first.",
        },
        {
          key: "load",
          label: "Pending workload",
          value: load,
          hint: "Monitor queue capacity levels regularly.",
        },
      ],
    };

    insightsCache.set("registrar-insights-trained", data, 60);
    return res.json(data);
  } catch (err) {
    console.error("Trained insights controller error:", err);
    return res.status(500).json({ insights: [] });
  }
}

export async function getRegistrarFlagged(_req, res) {
  try {
    const cached = insightsCache.get("registrar-flagged-trained");
    if (cached) return res.json(cached);

    const pendingApps = await getDecryptedPendingApps(200);
    const scam = await computeTrainedModelSignals(pendingApps);

    const response = { count: scam.scamCount, flagged: scam.flagged };
    insightsCache.set("registrar-flagged-trained", response, 60);

    return res.json(response);
  } catch (err) {
    console.error("Trained flagged list error:", err);
    return res.status(500).json({ count: 0, flagged: [] });
  }
}