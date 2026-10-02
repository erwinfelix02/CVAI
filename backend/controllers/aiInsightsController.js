import NodeCache from "node-cache";
import OpenAI from "openai";
import Preregistration from "../models/Preregistration.js";

const insightsCache = new NodeCache({ stdTTL: 60 });
const cloudHintCache = new NodeCache({ stdTTL: 300 });

// Initialize Ollama Cloud client (OpenAI-compatible)
const ollamaCloud = new OpenAI({
  apiKey: process.env.OLLAMA_CLOUD_API_KEY,
  baseURL: "https://ollama.com/v1", // Ollama Cloud endpoint
});

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

function buildInsightSignature({ scamCount, oldestPendingDays, load }) {
  return `scam:${scamCount}|oldest:${oldestPendingDays}|load:${load}`;
}

async function getDecryptedPendingApps(limit) {
  const docs = await Preregistration.find({ status: "Pending" })
    .select(
      "status createdAt registrationId personal.firstName personal.lastName personal.email personal.phone personal.address personal.birthDate academic.course",
    )
    .sort({ createdAt: -1 })
    .limit(limit);

  return docs.map((doc) => doc.toObject({ getters: true }));
}

/* ---------------------------
   Scam & Error Detection Rules
---------------------------- */
function normalizeName(first = "", last = "") {
  return `${first} ${last}`.toLowerCase().replace(/\s+/g, " ").trim();
}

function isSuspiciousEmail(email = "") {
  const e = String(email || "").toLowerCase().trim();
  if (!e) return true;
  if (e.includes("test") || e.includes("fake") || e.includes("asdf") || e.includes("tempmail")) {
    return true;
  }
  return false;
}

function isSuspiciousPhone(phone = "") {
  const p = String(phone || "").replace(/\D/g, "");
  if (!p) return true;
  // Enforce valid PH mobile prefix +639 / 09
  if (!/^09\d{9}$/.test(p) && !/^639\d{9}$/.test(p) && !/^\+639\d{9}$/.test(phone)) {
    return true;
  }
  return false;
}

function isSuspiciousName(name = "") {
  const n = String(name || "").trim();
  if (!n || n.length < 4 || /\d/.test(n)) return true;
  if (n.toLowerCase().includes("test") || n.toLowerCase().includes("asdf")) return true;
  return false;
}

function computeScamSignals(apps) {
  const nameCount = new Map();

  for (const a of apps) {
    const name = normalizeName(a?.personal?.firstName, a?.personal?.lastName);
    if (name) {
      nameCount.set(name, (nameCount.get(name) || 0) + 1);
    }
  }

  let scamCount = 0;
  const flagged = [];

  for (const a of apps) {
    const email = a?.personal?.email?.toLowerCase()?.trim() || "";
    const phone = a?.personal?.phone?.trim() || "";
    const name = normalizeName(a?.personal?.firstName, a?.personal?.lastName);
    const address = a?.personal?.address || "";

    const dupName = name && (nameCount.get(name) || 0) > 1;
    const suspiciousEmail = isSuspiciousEmail(email);
    const suspiciousPhone = isSuspiciousPhone(phone);
    const suspiciousName = isSuspiciousName(name);

    let score = 0;
    if (dupName) score += 2;
    if (suspiciousEmail) score += 1;
    if (suspiciousPhone) score += 2; // Heavy penalty for incorrect phone formatting (+639 format issues)
    if (suspiciousName) score += 1;

    if (score >= 2) {
      scamCount++;
      flagged.push({
        registrationId: a.registrationId,
        createdAt: a.createdAt,
        name: `${a?.personal?.firstName ?? ""} ${a?.personal?.lastName ?? ""}`.trim(),
        email: a?.personal?.email,
        phone: a?.personal?.phone,
        address: a?.personal?.address,
        course: a?.academic?.course,
        score,
        reasons: [
          dupName ? "Duplicate name match" : null,
          suspiciousEmail ? "Disposable or test email domain" : null,
          suspiciousPhone ? "Incorrect phone number prefix/length (Expected +639...)" : null,
          suspiciousName ? "Placeholder or test name string" : null,
        ].filter(Boolean),
      });
    }
  }

  flagged.sort((a, b) => b.score - a.score);
  return { scamCount, flagged };
}

/* ---------------------------
   Ollama Cloud Generation
---------------------------- */
async function callOllamaCloudJSON(prompt) {
  try {
    const response = await ollamaCloud.chat.completions.create({
      model: "gemma4:31b", // Replace with your target Ollama cloud catalog model identifier
      messages: [
        { role: "system", content: "You are a backend JSON generator helper. Return valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const raw = response.choices[0]?.message?.content || "";
    const extracted = extractJsonObject(raw);
    return safeJsonParse(extracted || raw);
  } catch (err) {
    console.error("Ollama Cloud API error:", err);
    return null;
  }
}

function buildFallbackInsights({ scamCount, oldestPendingDays, load }) {
  return {
    insights: [
      {
        key: "scam",
        label: "Suspicious registrations",
        value: String(scamCount),
        hint: "Review applications containing phone number formatting issues or mock text.",
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
}

async function getAiInsightsWithCache(metrics) {
  const signature = buildInsightSignature(metrics);
  const cached = cloudHintCache.get(signature);
  if (cached) return { data: cached, cacheHit: true };

  const expected = {
    scamValue: String(metrics.scamCount),
    oldestValue: `${metrics.oldestPendingDays} days`,
    loadValue: metrics.load,
  };

  const prompt = `
Return JSON only matching this exact structure:
{
  "insights": [
    {"key":"scam","label":"Suspicious registrations","value":"${expected.scamValue}","hint":"Write a brief 1-sentence tip."},
    {"key":"oldest","label":"Oldest pending","value":"${expected.oldestValue}","hint":"Write a brief 1-sentence tip."},
    {"key":"load","label":"Pending workload","value":"${expected.loadValue}","hint":"Write a brief 1-sentence tip."}
  ]
}
Rules: Keep keys, labels, and values exact. No markdown formatting.
`;

  const aiJson = await callOllamaCloudJSON(prompt);
  if (!aiJson || !Array.isArray(aiJson.insights) || aiJson.insights.length !== 3) {
    return { data: buildFallbackInsights(metrics), cacheHit: false };
  }

  cloudHintCache.set(signature, aiJson);
  return { data: aiJson, cacheHit: false };
}

export async function getRegistrarInsights(_req, res) {
  try {
    const cached = insightsCache.get("registrar-insights-final");
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

    const scam = computeScamSignals(pendingApps);
    const load = workloadLabel(pendingCount);

    const { data } = await getAiInsightsWithCache({
      scamCount: scam.scamCount,
      oldestPendingDays,
      load,
    });

    insightsCache.set("registrar-insights-final", data, 60);
    return res.json(data);
  } catch (err) {
    console.error("Insights controller error:", err);
    return res.status(500).json({ insights: [] });
  }
}

export async function getRegistrarFlagged(_req, res) {
  try {
    const cached = insightsCache.get("registrar-flagged-final");
    if (cached) return res.json(cached);

    const pendingApps = await getDecryptedPendingApps(200);
    const scam = computeScamSignals(pendingApps);

    const response = { count: scam.scamCount, flagged: scam.flagged };
    insightsCache.set("registrar-flagged-final", response, 60);

    return res.json(response);
  } catch (err) {
    console.error("Flagged list error:", err);
    return res.status(500).json({ count: 0, flagged: [] });
  }
}