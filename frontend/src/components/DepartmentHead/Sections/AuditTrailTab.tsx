// ✅ src/components/DepartmentHead/Sections/AuditTrailTab.tsx

import { useState } from "react";
import { Download } from "lucide-react";
import type { AuditLog } from "../../../pages/DepartmentHead/DepartmentHeadSections";

interface AuditTrailTabProps {
  auditLogs: AuditLog[];
}

export default function AuditTrailTab({ auditLogs }: AuditTrailTabProps) {
  const [isHoveredExport, setIsHoveredExport] = useState(false);

  const handleExportCSV = () => {
    if (auditLogs.length === 0) return;

    // Define CSV headers
    const headers = ["Student", "From Section", "To Section", "Assigned By", "Assigned At"];
    
    // Map log rows to CSV values
    const rows = auditLogs.map((log) => [
      `"${log.student.replace(/"/g, '""')}"`,
      `"${log.fromSection.replace(/"/g, '""')}"`,
      `"${log.toSection.replace(/"/g, '""')}"`,
      `"${log.assignedBy.replace(/"/g, '""')}"`,
      `"${log.assignedAt.replace(/"/g, '""')}"`,
    ]);

    // Combine headers and rows into a single CSV string
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    // Create a temporary anchor element to trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="card border-0 shadow-sm p-4"
      style={{ width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0 text-dark">Audit History</h5>
        <button
          type="button"
          className="btn btn-sm d-flex align-items-center gap-2 text-nowrap py-1 px-3 shadow-sm"
          style={{
            fontSize: "12px",
            backgroundColor: isHoveredExport ? "#0d5173" : "#ffffff",
            color: isHoveredExport ? "#ffffff" : "#0d5173",
            borderColor: "#0d5173",
            borderWidth: "1px",
            borderStyle: "solid",
            opacity: auditLogs.length === 0 ? 0.65 : 1,
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={() => setIsHoveredExport(true)}
          onMouseLeave={() => setIsHoveredExport(false)}
          onClick={handleExportCSV}
          disabled={auditLogs.length === 0}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div
        className="table-responsive"
        style={{ width: "100%", maxWidth: "100%", minWidth: 0, overflowX: "auto" }}
      >
        <table className="table align-middle mb-0" style={{ width: "100%", minWidth: "600px" }}>
          <thead className="table-light text-muted small">
            <tr>
              <th>Student</th>
              <th>From</th>
              <th>To</th>
              <th>Assigned By</th>
              <th>Assigned At</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted">
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="fw-semibold">{log.student}</td>
                  <td>{log.fromSection}</td>
                  <td>{log.toSection}</td>
                  <td>{log.assignedBy}</td>
                  <td className="text-muted small">{log.assignedAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}