import fetch from "node-fetch"; // remove if Node 18+ and using global fetch
import NodeCache from "node-cache";
import Preregistration from "../models/Preregistration.js";

const insightsCache = new NodeCache({ stdTTL: 60 });
const ollamaHintCache = new NodeCache({ stdTTL: 300 });

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
   Scam detection rules
---------------------------- */
function normalizeName(first = "", last = "") {
  return `${first} ${last}`.toLowerCase().replace(/\s+/g, " ").trim();
}

function uniqueCharRatio(str = "") {
  if (!str) return 0;
  const clean = String(str).toLowerCase().replace(/\s+/g, "");
  if (!clean) return 0;
  return new Set(clean).size / clean.length;
}

function vowelRatio(str = "") {
  const clean = String(str).toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  const vowels = (clean.match(/[aeiou]/g) || []).length;
  return vowels / clean.length;
}

function consonantRunLength(str = "") {
  const clean = String(str).toLowerCase().replace(/[^a-z]/g, "");
  let best = 0;
  let cur = 0;

  for (const ch of clean) {
    if ("aeiou".includes(ch)) {
      cur = 0;
    } else {
      cur++;
      if (cur > best) best = cur;
    }
  }

  return best;
}

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

function repeatedPairScore(str = "") {
  const clean = String(str).replace(/\s+/g, "");
  let count = 0;

  for (let i = 0; i < clean.length - 1; i++) {
    const pair = clean.slice(i, i + 2);
    const occurrences = clean.split(pair).length - 1;
    if (occurrences >= 3) count++;
  }

  return count;
}

function looksLikeKeyboardMash(str = "") {
  const s = String(str).toLowerCase().replace(/[^a-z]/g, "");
  if (s.length < 8) return false;

  const keyboardish = [
    "asdf",
    "qwer",
    "zxcv",
    "qwerty",
    "asdfg",
    "hjkl",
    "poiuy",
  ];

  return keyboardish.some((k) => s.includes(k));
}

function isSuspiciousEmail(email = "") {
  const e = String(email || "").toLowerCase().trim();
  if (!e) return true;

  if (
    e.includes("test") ||
    e.includes("fake") ||
    e.includes("asdf") ||
    e.includes("qwerty")
  ) {
    return true;
  }

  const parts = e.split("@");
  if (parts.length !== 2) return true;
  if (!parts[1] || !parts[1].includes(".")) return true;

  const local = parts[0];
  if (!local || local.length < 3) return true;

  if (/^\d+$/.test(local)) return true;
  if (maxRunLength(local) >= 5) return true;
  if (looksLikeKeyboardMash(local)) return true;

  return false;
}

function isSuspiciousPhone(phone = "") {
  const p = String(phone || "").replace(/\D/g, "");
  if (!p) return true;

  // PH mobile: usually 11 digits starting with 09
  if (!/^09\d{9}$/.test(p)) return true;

  if (/^(\d)\1+$/.test(p)) return true;
  if (maxRunLength(p) >= 6) return true;

  // catches patterns like 09211111111
  const last9 = p.slice(2);
  if (maxRunLength(last9) >= 5) return true;

  // too few unique digits
  if (new Set(p).size <= 3) return true;

  // repeated tiny patterns
  if (/(\d{2,3})\1{2,}/.test(p)) return true;

  return false;
}

function isSuspiciousName(name = "") {
  const n = String(name || "").trim();
  if (!n) return true;
  if (n.length < 4) return true;
  if (/\d/.test(n)) return true;
  if (/^(.)\1{3,}/.test(n.replace(/\s/g, ""))) return true;

  const lettersOnly = n.replace(/[^A-Za-z\s'-]/g, "");
  if (lettersOnly.trim().length < 4) return true;

  if (looksLikeKeyboardMash(lettersOnly)) return true;
  if (consonantRunLength(lettersOnly) >= 6) return true;

  return false;
}

function isSuspiciousAddress(address = "") {
  const a = String(address || "").trim();
  if (!a) return true;
  if (a.length < 10) return true;

  const lower = a.toLowerCase();

  if (
    lower.includes("test") ||
    lower.includes("asdf") ||
    lower.includes("fake") ||
    lower.includes("qwerty")
  ) {
    return true;
  }

  if (/^(\w)\1{5,}$/.test(a.replace(/\s/g, ""))) return true;

  const lettersOnly = lower.replace(/[^a-z]/g, "");
  const words = lower.split(/[\s,.-/#]+/).filter(Boolean);

  if (looksLikeKeyboardMash(lower)) return true;

  // many long consonant runs are usually gibberish
  if (consonantRunLength(lower) >= 6) return true;

  // very low vowel ratio often means mash text
  if (lettersOnly.length >= 10 && vowelRatio(lettersOnly) < 0.20) return true;

  // too repetitive
  if (lettersOnly.length >= 10 && uniqueCharRatio(lettersOnly) < 0.35) return true;

  // repeating short fragments
  if (repeatedPairScore(lettersOnly) >= 2) return true;

  // address should usually have at least 2 meaningful chunks
  if (words.length < 2 && a.length >= 12) return true;

  // catches strings like askjadamdnm,adadd
  const longWeirdWords = words.filter(
    (w) =>
      w.length >= 6 &&
      !/\d/.test(w) &&
      vowelRatio(w) < 0.25 &&
      consonantRunLength(w) >= 4,
  );

  if (longWeirdWords.length >= 1) return true;

  const hasDigit = /\d/.test(a);
  const hasCommaOrSpace = /[\s,]/.test(a);

  // not required, but many realistic addresses have separators or numbers
  if (!hasDigit && !hasCommaOrSpace && a.length >= 14) return true;

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
   Ollama call
---------------------------- */
async function callOllamaJSON(prompt) {
  const url = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL || "tinyllama";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const r = await fetch(`${url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 120,
        },
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

/* ---------------------------
   AI output validation
---------------------------- */
function isBadAi(aiJson, expected) {
  if (
    !aiJson ||
    !Array.isArray(aiJson.insights) ||
    aiJson.insights.length !== 3
  ) {
    return true;
  }

  const byKey = new Map(aiJson.insights.map((x) => [x.key, x]));
  const scam = byKey.get("scam");
  const oldest = byKey.get("oldest");
  const load = byKey.get("load");

  if (!scam || !oldest || !load) return true;

  if (String(scam.value) !== String(expected.scamValue)) return true;
  if (String(oldest.value) !== String(expected.oldestValue)) return true;
  if (String(load.value) !== String(expected.loadValue)) return true;

  for (const it of [scam, oldest, load]) {
    const hint = String(it?.hint ?? "");
    const label = String(it?.label ?? "");
    if (!hint.trim()) return true;
    if (hint.includes("<") || hint.includes(">")) return true;
    if (label !== expected.labels[it.key]) return true;
  }

  return false;
}

/* ---------------------------
   Deterministic fallback
---------------------------- */
function buildFallbackInsights({ scamCount, oldestPendingDays, load }) {
  return {
    insights: [
      {
        key: "scam",
        label: "Suspicious registrations",
        value: String(scamCount),
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
}

/* ---------------------------
   Cached AI hints
---------------------------- */
async function getAiInsightsWithCache(metrics) {
  const signature = buildInsightSignature(metrics);
  const cached = ollamaHintCache.get(signature);
  if (cached) {
    return { data: cached, cacheHit: true };
  }

  const expected = {
    scamValue: String(metrics.scamCount),
    oldestValue: `${metrics.oldestPendingDays} days`,
    loadValue: metrics.load,
    labels: {
      scam: "Suspicious registrations",
      oldest: "Oldest pending",
      load: "Pending workload",
    },
  };

  const prompt = `
Return JSON only:
{
  "insights": [
    {"key":"scam","label":"Suspicious registrations","value":"${expected.scamValue}","hint":"short sentence"},
    {"key":"oldest","label":"Oldest pending","value":"${expected.oldestValue}","hint":"short sentence"},
    {"key":"load","label":"Pending workload","value":"${expected.loadValue}","hint":"short sentence"}
  ]
}
Rules:
- Keep every key, label, and value exactly the same.
- Only write the hints.
- No markdown.
- No extra text.
`;

  const aiJson = await callOllamaJSON(prompt);

  if (isBadAi(aiJson, expected)) {
    return { data: buildFallbackInsights(metrics), cacheHit: false };
  }

  ollamaHintCache.set(signature, aiJson);
  return { data: aiJson, cacheHit: false };
}

/* ---------------------------
   Controller: insights
---------------------------- */
export async function getRegistrarInsights(_req, res) {
  const requestStart = Date.now();

  try {
    console.log("===== AI INSIGHTS REQUEST START =====");

    const cached = insightsCache.get("registrar-insights-final");
    if (cached) {
      console.log(
        `AI Insights final cache hit: ${((Date.now() - requestStart) / 1000).toFixed(3)} sec`,
      );
      console.log("===== AI INSIGHTS REQUEST END =====");
      return res.json(cached);
    }

    const dbStart = Date.now();

    const pendingApps = await getDecryptedPendingApps(60);

    const dbEnd = Date.now();
    console.log(
      `AI Insights DB fetch time: ${((dbEnd - dbStart) / 1000).toFixed(3)} sec`,
    );

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

    const metrics = {
      scamCount: scam.scamCount,
      oldestPendingDays,
      load,
    };

    const ollamaStart = Date.now();
    const { data, cacheHit } = await getAiInsightsWithCache(metrics);
    const ollamaEnd = Date.now();

    console.log(
      `AI Insights Ollama time: ${((ollamaEnd - ollamaStart) / 1000).toFixed(3)} sec (${cacheHit ? "hint-cache" : "fresh"})`,
    );

    insightsCache.set("registrar-insights-final", data, 60);

    console.log(
      `AI Insights total response time: ${((Date.now() - requestStart) / 1000).toFixed(3)} sec`,
    );
    console.log("===== AI INSIGHTS REQUEST END =====");

    return res.json(data);
  } catch (err) {
    console.error("AI insights controller error:", err);
    console.log(
      `AI Insights failed after: ${((Date.now() - requestStart) / 1000).toFixed(3)} sec`,
    );
    console.log("===== AI INSIGHTS REQUEST END =====");

    return res.status(500).json({ insights: [] });
  }
}

/* ---------------------------
   Controller: flagged
---------------------------- */
export async function getRegistrarFlagged(_req, res) {
  const requestStart = Date.now();

  try {
    console.log("===== FLAGGED REGISTRATIONS REQUEST START =====");

    const cached = insightsCache.get("registrar-flagged-final");
    if (cached) {
      console.log(
        `Flagged final cache hit: ${((Date.now() - requestStart) / 1000).toFixed(3)} sec`,
      );
      console.log("===== FLAGGED REGISTRATIONS REQUEST END =====");
      return res.json(cached);
    }

    const dbStart = Date.now();

    const pendingApps = await getDecryptedPendingApps(200);

    const dbEnd = Date.now();
    console.log(
      `Flagged DB fetch time: ${((dbEnd - dbStart) / 1000).toFixed(3)} sec`,
    );

    const scam = computeScamSignals(pendingApps);

    const response = {
      count: scam.scamCount,
      flagged: scam.flagged,
    };

    insightsCache.set("registrar-flagged-final", response, 60);

    console.log(
      `Flagged total response time: ${((Date.now() - requestStart) / 1000).toFixed(3)} sec`,
    );
    console.log("===== FLAGGED REGISTRATIONS REQUEST END =====");

    return res.json(response);
  } catch (err) {
    console.error("Flagged list error:", err);
    console.log(
      `Flagged request failed after: ${((Date.now() - requestStart) / 1000).toFixed(3)} sec`,
    );
    console.log("===== FLAGGED REGISTRATIONS REQUEST END =====");

    return res.status(500).json({ count: 0, flagged: [] });
  }
}