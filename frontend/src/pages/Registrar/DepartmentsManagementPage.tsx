import { useEffect, useMemo, useState } from "react";
import { Plus, Building2 } from "lucide-react";

import AuthAlert from "../../components/Authentication/AuthAlert";
import DepartmentStatsRow from "../../components/Registrar/Departments/DepartmentStatsRow";
import DepartmentsToolbar from "../../components/Registrar/Departments/DepartmentsToolbar";
import DepartmentsTable from "../../components/Registrar/Departments/DepartmentsTable";

import type { DepartmentItem } from "../../components/Registrar/Departments/types";
import { getDepartments } from "../../api/departmentService";

import "../../styles/departments.css";

export default function DepartmentsManagementPage() {
  const [items, setItems] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");

  // ✅ AuthAlert state
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

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
    const t = setTimeout(() => setAnimateAlert(false), 3000);
    return () => clearTimeout(t);
  }, [animateAlert]);

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      const data = await getDepartments();

      const mapped: DepartmentItem[] = (Array.isArray(data) ? data : []).map(
        (d: any) => ({
          id: d._id,
          code: d.code ?? "",
          name: d.name ?? "",
          description: d.description ?? "",
          head: d.head ?? "",
          status: d.status === "Inactive" ? "Inactive" : "Active",
        }),
      );

      setItems(mapped);
    } catch (err: any) {
      setItems([]);
      showAlert(
        err.response?.data?.message || "Failed to load departments.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((d) => {
      const hay =
        `${d.code} ${d.name} ${d.description} ${d.head} ${d.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((d) => d.status === "Active").length;
    const inactive = items.filter((d) => d.status === "Inactive").length;
    return { total, active, inactive };
  }, [items]);

  const hasRows = filtered.length > 0;

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={isLoading}
      />

      <div className="sad-dept-page container-fluid px-3 px-md-4">
        <div className="d-flex flex-column flex-lg-row align-items-lg-start justify-content-lg-between gap-3 mb-3 mb-md-4">
          <div>
            <h2 className="fw-bold mb-1">Departments</h2>
            <p className="text-muted mb-0">
              Manage academic departments and their status
            </p>
          </div>

          {/* ✅ No modal yet */}
          <button
            className="btn btn-primary btn-lg sad-dept-add-btn"
            onClick={() =>
              showAlert("Add Department modal not implemented yet.", "error")
            }
            disabled={isLoading}
            type="button"
          >
            <Plus size={18} />
            <span className="ms-2">Add Department</span>
          </button>
        </div>

        <DepartmentStatsRow
          total={stats.total}
          active={stats.active}
          inactive={stats.inactive}
        />

        <div className="card shadow-sm border-0 mt-3 mt-md-4">
          <div className="card-body p-3 p-md-4">
            <DepartmentsToolbar query={query} onQueryChange={setQuery} />

            {hasRows ? (
              <DepartmentsTable
                items={filtered}
                onEdit={() => showAlert("Edit modal not implemented yet.", "error")}
                onDelete={() => showAlert("Delete modal not implemented yet.", "error")}
              />
            ) : (
              <div className="sad-empty">
                <div className="sad-empty-icon">
                  <Building2 size={46} />
                </div>
                <h5 className="fw-semibold mb-1">No departments found</h5>
                <p className="text-muted mb-0">
                  Try searching or click <b>Add Department</b>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}