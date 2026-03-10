import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsFilePath = path.join(__dirname, "../data/logs.json");

function ensureLogsFile() {
  const dir = path.dirname(logsFilePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(logsFilePath)) {
    fs.writeFileSync(logsFilePath, "[]", "utf-8");
  }
}

/**
 * @param {import("express").Request} req
 */
export function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

export function getAllLogs() {
  ensureLogsFile();

  try {
    const raw = fs.readFileSync(logsFilePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * @param {Array<any>} logs
 */
export function saveAllLogs(logs) {
  ensureLogsFile();
  fs.writeFileSync(logsFilePath, JSON.stringify(logs, null, 2), "utf-8");
}

/**
 * @param {{
 *   action: string;
 *   user: string;
 *   role?: string;
 *   type: string;
 *   details: string;
 *   ip?: string;
 *   status: string;
 * }} param0
 */
export function addLog({
  action,
  user,
  role = "unknown",
  type,
  details,
  ip = "unknown",
  status,
}) {
  const logs = getAllLogs();
  const now = new Date();

  const log = {
    id: crypto.randomUUID(),
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 8),
    action,
    user,
    role,
    type,
    details,
    ip,
    status,
  };

  logs.unshift(log);
  saveAllLogs(logs);

  return log;
}