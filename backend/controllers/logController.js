import XLSX from "xlsx";
import { getAllLogs, addLog } from "../utils/logActivity.js";

export const createLog = async (req, res) => {
  try {
    const { action, user, role, type, details, status } = req.body;

    addLog({
      action,
      user,
      role,
      type,
      details,
      status,
      ip:
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        req.ip ||
        "Unknown IP",
    });

    return res.status(201).json({ message: "Log created successfully." });
  } catch (err) {
    console.error("createLog error:", err);
    return res.status(500).json({ message: "Failed to create log." });
  }
};

export const getLogs = async (req, res) => {
  try {
    const logs = getAllLogs();

    const query = String(req.query.query || "").trim().toLowerCase();
    const type = String(req.query.type || "All");
    const status = String(req.query.status || "All");

    const filtered = logs.filter((r) => {
      const matchesQuery =
        !query ||
        r.action.toLowerCase().includes(query) ||
        r.user.toLowerCase().includes(query) ||
        r.ip.toLowerCase().includes(query) ||
        r.details.toLowerCase().includes(query);

      const matchesType = type === "All" ? true : r.type === type;
      const matchesStatus = status === "All" ? true : r.status === status;

      return matchesQuery && matchesType && matchesStatus;
    });

    return res.json(filtered);
  } catch (err) {
    console.error("getLogs error:", err);
    return res.status(500).json({ message: "Failed to load logs." });
  }
};

export const getLogStats = async (_req, res) => {
  try {
    const logs = getAllLogs();

    return res.json({
      total: logs.length,
      success: logs.filter((x) => x.status === "success").length,
      warnings: logs.filter((x) => x.status === "warning").length,
      errors: logs.filter((x) => x.status === "error").length,
      security: logs.filter((x) => x.type === "Security").length,
    });
  } catch (err) {
    console.error("getLogStats error:", err);
    return res.status(500).json({ message: "Failed to load log stats." });
  }
};

export const exportLogs = async (req, res) => {
  try {
    const logs = getAllLogs();
    const status = String(req.query.status || "All");

    const filtered =
      status === "All"
        ? logs
        : logs.filter((log) => log.status === status);

    const rows = filtered.map((log) => ({
      Date: log.date,
      Time: log.time,
      Action: log.action,
      User: log.user,
      Role: log.role,
      Type: log.type,
      Details: log.details,
      "IP Address": log.ip,
      Status: log.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "System Logs");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const suffix = status === "All" ? "all" : status.toLowerCase();
    const fileName = `system-logs-${suffix}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    return res.send(buffer);
  } catch (err) {
    console.error("exportLogs error:", err);
    return res.status(500).json({ message: "Failed to export logs." });
  }
};