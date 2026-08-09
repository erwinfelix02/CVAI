import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Download,
  X,
  FileSpreadsheet,
  TriangleAlert,
} from "lucide-react";

import LogsHeader from "../../components/SuperAdmin/SystemLogs/LogsHeader";
import LogsStats from "../../components/SuperAdmin/SystemLogs/LogsStats";
import LogsFilters from "../../components/SuperAdmin/SystemLogs/LogsFilters";
import LogsTable from "../../components/SuperAdmin/SystemLogs/LogsTable";
import AuthAlert from "../../components/Authentication/AuthAlert";

import type {
  LogRow,
  LogStatus,
  LogType,
  StatCard,
} from "../../components/SuperAdmin/SystemLogs/types";
import "../../styles/superadmin-logs.css";
import { API_BASE_URL } from "../../config";

type ExportStatus = "All" | "success" | "warning" | "error";

export default function ActivityLogsPage() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<LogType | "All">("All");
  const [status, setStatus] = useState<LogStatus | "All">("All");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedExportStatus, setSelectedExportStatus] =
    useState<ExportStatus>("All");

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const [stats, setStats] = useState<StatCard[]>([
    { label: "Total Events", value: 0, icon: Activity, tone: "blue" },
    { label: "Successful", value: 0, icon: CheckCircle2, tone: "green" },
    { label: "Warnings", value: 0, icon: AlertTriangle, tone: "orange" },
    { label: "Security Events", value: 0, icon: Shield, tone: "red" },
  ]);

  const showAlert = (message: string, type: "success" | "error") => {
    setAnimateAlert(false);

    setTimeout(() => {
      setAlertMessage(message);
      setAlertType(type);
      setAnimateAlert(true);
    }, 50);
  };

  useEffect(() => {
    if (!animateAlert) return;

    const t = setTimeout(() => {
      setAnimateAlert(false);
    }, 3000);

    return () => clearTimeout(t);
  }, [animateAlert]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE_URL}/logs`, {
        params: {
          query,
          type,
          status,
        },
      });

      setRows(res.data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setRows([]);
      showAlert("Failed to fetch logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/logs/stats`);
      const data = res.data;

      setStats([
        {
          label: "Total Events",
          value: data.total,
          icon: Activity,
          tone: "blue",
        },
        {
          label: "Successful",
          value: data.success,
          icon: CheckCircle2,
          tone: "green",
        },
        {
          label: "Warnings",
          value: data.warnings,
          icon: AlertTriangle,
          tone: "orange",
        },
        {
          label: "Security Events",
          value: data.security,
          icon: Shield,
          tone: "red",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStats([
        { label: "Total Events", value: 0, icon: Activity, tone: "blue" },
        { label: "Successful", value: 0, icon: CheckCircle2, tone: "green" },
        { label: "Warnings", value: 0, icon: AlertTriangle, tone: "orange" },
        { label: "Security Events", value: 0, icon: Shield, tone: "red" },
      ]);
      showAlert("Failed to fetch log statistics.", "error");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [query, type, status]);

  useEffect(() => {
    fetchStats();
  }, [rows.length]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || exporting) return;

      if (confirmModalOpen) {
        setConfirmModalOpen(false);
        return;
      }

      if (exportModalOpen) {
        setExportModalOpen(false);
      }
    };

    if (exportModalOpen || confirmModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [exportModalOpen, confirmModalOpen, exporting]);

  const filtered = useMemo(() => rows, [rows]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([fetchLogs(), fetchStats()]);
      showAlert("Logs refreshed successfully.", "success");
    } catch (error) {
      console.error("Refresh failed:", error);
      showAlert("Failed to refresh logs.", "error");
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    }
  };

  const handleExport = () => {
    setSelectedExportStatus("All");
    setConfirmModalOpen(false);
    setExportModalOpen(true);
  };

  const handleOpenConfirm = () => {
    setConfirmModalOpen(true);
  };

  const handleCloseExportModal = () => {
    if (exporting) return;
    setExportModalOpen(false);
  };

  const handleCloseConfirmModal = () => {
    if (exporting) return;
    setConfirmModalOpen(false);
  };

  const handleDownloadExport = async () => {
    try {
      setExporting(true);

      const res = await axios.get(`${API_BASE_URL}/logs/export`, {
        params: { status: selectedExportStatus },
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const suffix =
        selectedExportStatus === "All"
          ? "all"
          : selectedExportStatus.toLowerCase();

      link.href = url;
      link.download = `system-logs-${suffix}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setConfirmModalOpen(false);
      setExportModalOpen(false);
      showAlert(
        `Logs exported successfully (${selectedExportStatus}).`,
        "success",
      );
    } catch (error) {
      console.error("Failed to export logs:", error);
      showAlert("Failed to export logs.", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={refreshing || exporting}
      />

      <div className="superadmin-logs">
        <LogsHeader
          title="Activity Logs & Monitoring"
          subtitle="Monitor system activity and security events"
          onRefresh={handleRefresh}
          onExport={handleExport}
          refreshing={refreshing}
        />

        <LogsStats items={stats} />

        <LogsFilters
          query={query}
          setQuery={setQuery}
          type={type}
          setType={setType}
          status={status}
          setStatus={setStatus}
        />

        {loading ? (
          <div className="card shadow-sm superadmin-logs-card">
            <div className="card-body p-4 text-center text-muted">
              Loading logs...
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <LogsTable rows={filtered} />
        ) : (
          <div className="card shadow-sm superadmin-logs-card">
            <div className="card-body py-5 text-center">
              <div className="users-empty-icon">📝</div>
              <h5 className="fw-semibold mb-1">No logs found</h5>
              <p className="text-muted mb-0">
                Try adjusting your search or filters.
              </p>
            </div>
          </div>
        )}

        {exportModalOpen && (
          <div
            className="superadmin-logs-modal-backdrop"
            onClick={handleCloseExportModal}
          >
            <div
              className="superadmin-logs-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="superadmin-logs-modal-header">
                <div className="d-flex align-items-center gap-2">
                  <div className="superadmin-logs-modal-icon">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">Export Logs</h5>
                    <p className="text-muted mb-0">
                      Choose which logs you want to export to Excel.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="superadmin-logs-modal-close app-icon-btn app-icon-btn-sm"
                  onClick={handleCloseExportModal}
                  aria-label="Close"
                  title="Close"
                  disabled={exporting}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="superadmin-logs-modal-body">
                <div className="superadmin-logs-export-options">
                  <button
                    type="button"
                    className={`superadmin-logs-export-option ${
                      selectedExportStatus === "All" ? "active" : ""
                    }`}
                    onClick={() => setSelectedExportStatus("All")}
                    disabled={exporting}
                  >
                    <div className="fw-semibold">All Logs</div>
                    <div className="text-muted small">
                      Export every log record
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`superadmin-logs-export-option ${
                      selectedExportStatus === "success" ? "active" : ""
                    }`}
                    onClick={() => setSelectedExportStatus("success")}
                    disabled={exporting}
                  >
                    <div className="fw-semibold">Successful</div>
                    <div className="text-muted small">
                      Only successful log entries
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`superadmin-logs-export-option ${
                      selectedExportStatus === "warning" ? "active" : ""
                    }`}
                    onClick={() => setSelectedExportStatus("warning")}
                    disabled={exporting}
                  >
                    <div className="fw-semibold">Warnings</div>
                    <div className="text-muted small">
                      Only warning log entries
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`superadmin-logs-export-option ${
                      selectedExportStatus === "error" ? "active" : ""
                    }`}
                    onClick={() => setSelectedExportStatus("error")}
                    disabled={exporting}
                  >
                    <div className="fw-semibold">Errors</div>
                    <div className="text-muted small">
                      Only error log entries
                    </div>
                  </button>
                </div>
              </div>

              <div className="superadmin-logs-modal-footer">
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={handleCloseExportModal}
                  disabled={exporting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={handleOpenConfirm}
                  disabled={exporting}
                >
                  <Download size={16} />
                  Download Excel
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmModalOpen && (
          <div
            className="superadmin-logs-confirm-backdrop"
            onClick={handleCloseConfirmModal}
          >
            <div
              className="superadmin-logs-confirm-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="superadmin-logs-confirm-icon">
                <TriangleAlert size={22} />
              </div>

              <h5 className="fw-bold mb-2 text-center">Confirm Export</h5>

              <p className="text-muted text-center mb-0">
                Are you sure you want to export{" "}
                <span className="fw-semibold">{selectedExportStatus}</span> logs
                as an Excel file?
              </p>

              <div className="superadmin-logs-confirm-actions">
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={handleCloseConfirmModal}
                  disabled={exporting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={handleDownloadExport}
                  disabled={exporting}
                >
                  <Download size={16} />
                  {exporting ? "Exporting..." : "Yes, Export"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
