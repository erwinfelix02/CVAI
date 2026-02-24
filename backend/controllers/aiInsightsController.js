// controllers/aiInsightsController.js
import fetch from "node-fetch"; // remove if Node 18+ and using global fetch
import Preregistration from "../models/Preregistration.js";

/* ---------------------------
   Helpers
---------------------------- */
function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractJsonObject(text) {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function daysBetween(dateA, dateB) {
  const ms = Math.abs(new Date(dateB).getTime() - new Date(dateA).getTime());
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function workloadLabel(pendingCount) {
  if (pendingCount <= 10) return "Low";
  if (pendingCount <= 30) return "Medium";
  return "High";
}

/* ---------------------------
   Scam detection rules
---------------------------- */
function normalizeName(first = "", last = "") {
  return `${first} ${last}`.toLowerCase().replace(/\s+/g, " ").trim();
}

function isSuspiciousEmail(email = "") {
  const e = (email || "").toLowerCase().trim();
  if (!e) return true;

  if (e.includes("test") || e.includes("fake") || e.includes("asdf"))
    return true;

  const parts = e.split("@");
  if (parts.length !== 2) return true;
  if (!parts[1] || !parts[1].includes(".")) return true;

  const local = parts[0];
  if (!local || local.length < 3) return true;

  return false;
}

// longest run of same digit, e.g. "09111111111" has a long run of "1"
function maxRunLength(str) {
  if (!str) return 0;
  let best = 1;
  let cur = 1;
  for (let i = 1; i < str.length; i++) {
    if (str[i] === str[i - 1]) cur++;
    else cur = 1;
    if (cur > best) best = cur;
  }
  return best;
}

function isSuspiciousPhone(phone = "") {
  const p = (phone || "").replace(/\D/g, "");
  if (!p) return true;
  if (p.length < 10) return true;

  if (/^(\d)\1+$/.test(p)) return true;

  // catches 09111111111
  if (maxRunLength(p) >= 7) return true;

  return false;
}

function isSuspiciousName(name = "") {
  if (!name) return true;

  const n = (name || "").trim();
  if (n.length < 4) return true;

  if (/^(.)\1{3,}/.test(n.replace(/\s/g, ""))) return true;
  if (/\d/.test(n)) return true;

  return false;
}

function isSuspiciousAddress(address = "") {
  const a = (address || "").trim();
  if (!a) return true;
  if (a.length < 10) return true;

  const lower = a.toLowerCase();
  if (
    lower.includes("test") ||
    lower.includes("asdf") ||
    lower.includes("fake")
  )
    return true;

  if (/^(\w)\1{5,}$/.test(a.replace(/\s/g, ""))) return true;

  const hasSpace = /\s/.test(a);
  const hasDigit = /\d/.test(a);
  const hasPunct = /[,\-./#]/.test(a);

  // gibberish: long single token
  if (!hasSpace && !hasDigit && !hasPunct && a.length >= 12) return true;

  return false;
}

function isSuspiciousBirthDate(birthDate = "") {
  if (!birthDate) return true;

  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return true;

  const year = d.getUTCFullYear();
  const nowYear = new Date().getFullYear();

  if (year < 1900) return true;

  const age = nowYear - year;
  if (age < 10 || age > 90) return true;

  return false;
}

function computeScamSignals(apps) {
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
    const address = a?.personal?.address || "";
    const birthDate = a?.personal?.birthDate || "";

    const dupName = name && (nameCount.get(name) || 0) > 1;

    const suspiciousEmail = isSuspiciousEmail(email);
    const suspiciousPhone = isSuspiciousPhone(phone);
    const suspiciousName = isSuspiciousName(name);
    const suspiciousAddress = isSuspiciousAddress(address);
    const suspiciousBirthDate = isSuspiciousBirthDate(birthDate);

    let score = 0;
    if (dupName) score += 2;
    if (suspiciousEmail) score += 1;
    if (suspiciousPhone) score += 1;
    if (suspiciousName) score += 1;
    if (suspiciousAddress) score += 1;
    if (suspiciousBirthDate) score += 1;

    const isScam = score >= 2;

    if (isScam) {
      scamCount++;

      flagged.push({
        registrationId: a.registrationId,
        createdAt: a.createdAt,
        name: `${a?.personal?.firstName ?? ""} ${a?.personal?.lastName ?? ""}`.trim(),
        email: a?.personal?.email,
        phone: a?.personal?.phone,
        course: a?.academic?.course,
        score,
        reasons: [
          dupName ? "Duplicate name" : null,
          suspiciousEmail ? "Suspicious email" : null,
          suspiciousPhone ? "Suspicious phone" : null,
          suspiciousName ? "Suspicious name" : null,
          suspiciousAddress ? "Suspicious address" : null,
          suspiciousBirthDate ? "Unrealistic birthdate" : null,
        ].filter(Boolean),
      });
    }
  }

  flagged.sort((a, b) => b.score - a.score);

  return { scamCount, flagged };
}

/* ---------------------------
   Ollama call (optional)
---------------------------- */
async function callOllamaJSON(prompt) {
  const url = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL || "tinyllama";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const r = await fetch(`${url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0.2 },
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      throw new Error(`Ollama error ${r.status}: ${text}`);
    }

    const data = await r.json();
    const raw = data?.response || "";

    const extracted = extractJsonObject(raw);
    const parsed = safeJsonParse(extracted || raw);
    return parsed;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * ✅ Reject bad AI outputs:
 * - must contain exactly scam/oldest/load
 * - hint can't include placeholders like <...>
 * - value MUST match expected (prevents "Loow")
 */
function isBadAi(aiJson, expected) {
  if (
    !aiJson ||
    !Array.isArray(aiJson.insights) ||
    aiJson.insights.length !== 3
  )
    return true;

  const byKey = new Map(aiJson.insights.map((x) => [x.key, x]));
  const scam = byKey.get("scam");
  const oldest = byKey.get("oldest");
  const load = byKey.get("load");

  if (!scam || !oldest || !load) return true;

  // enforce exact values
  if (String(scam.value) !== String(expected.scamValue)) return true;
  if (String(oldest.value) !== String(expected.oldestValue)) return true;
  if (String(load.value) !== String(expected.loadValue)) return true;

  // reject placeholder / empty hints
  for (const it of [scam, oldest, load]) {
    const hint = String(it?.hint ?? "");
    const label = String(it?.label ?? "");
    if (!hint.trim()) return true;

    // blocks "<one short sentence>" and any "<...>"
    if (hint.includes("<") || hint.includes(">")) return true;

    // avoid instruction echoes
    if (hint.toLowerCase().includes("write 1 short")) return true;

    // keep labels correct
    if (label !== expected.labels[it.key]) return true;
  }

  return false;
}

/* ---------------------------
   Controller
---------------------------- */
export async function getRegistrarInsights(_req, res) {
  try {
    const recentApps = await Preregistration.find({})
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();

    const pendingApps = recentApps.filter((x) => x.status === "Pending");
    const pendingCount = pendingApps.length;

    let oldestPendingDays = 0;
    if (pendingApps.length) {
      const oldestMs = pendingApps.reduce((min, a) => {
        const d = new Date(a.createdAt).getTime();
        return d < min ? d : min;
      }, new Date(pendingApps[0].createdAt).getTime());

      oldestPendingDays = daysBetween(oldestMs, new Date());
    }

    const scam = computeScamSignals(pendingApps);
    const load = workloadLabel(pendingCount);

    const fallback = {
      insights: [
        {
          key: "scam",
          label: "Suspicious registrations",
          value: String(scam.scamCount),
          hint: "Check entries with unusual phone, address, or unrealistic birthdate details.",
        },
        {
          key: "oldest",
          label: "Oldest pending",
          value: `${oldestPendingDays} days`,
          hint: "Process older applications first to reduce backlog.",
        },
        {
          key: "load",
          label: "Pending workload",
          value: load,
          hint: "Assign more reviewers if pending applications increase.",
        },
      ],
    };

    const expected = {
      scamValue: String(scam.scamCount),
      oldestValue: `${oldestPendingDays} days`,
      loadValue: load,
      labels: {
        scam: "Suspicious registrations",
        oldest: "Oldest pending",
        load: "Pending workload",
      },
    };

    // ✅ Prompt: generate hints only, keep labels/values fixed
    const prompt = `
Return ONLY valid JSON exactly like this:

{
  "insights": [
    {"key":"scam","label":"Suspicious registrations","value":"${expected.scamValue}","hint":"ONE short sentence."},
    {"key":"oldest","label":"Oldest pending","value":"${expected.oldestValue}","hint":"ONE short sentence."},
    {"key":"load","label":"Pending workload","value":"${expected.loadValue}","hint":"ONE short sentence."}
  ]
}

Rules:
- Do NOT change key/label/value.
- The hint must be a real sentence (no placeholders, no angle brackets).
- JSON only. No markdown. No extra text.
`;

    try {
      const aiJson = await callOllamaJSON(prompt);
      if (!isBadAi(aiJson, expected)) return res.json(aiJson);
      return res.json(fallback);
    } catch (e) {
      console.error("Ollama insights failed:", e?.message || e);
      return res.json(fallback);
    }
  } catch (err) {
    console.error("AI insights controller error:", err);
    return res.status(500).json({ insights: [] });
  }
}

export async function getRegistrarFlagged(_req, res) {
  try {
    const recentApps = await Preregistration.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const pendingApps = recentApps.filter((x) => x.status === "Pending");

    const scam = computeScamSignals(pendingApps);

    return res.json({
      count: scam.scamCount,
      flagged: scam.flagged,
    });
  } catch (err) {
    console.error("Flagged list error:", err);
    return res.status(500).json({ count: 0, flagged: [] });
  }
}