// ✅ src/components/DepartmentHead/Sections/SectionTabs.tsx

import { Users, Clock, History } from "lucide-react";

interface SectionTabsProps {
  activeTab: "bulk" | "requests" | "audit";
  onTabChange: (tab: "bulk" | "requests" | "audit") => void;
  requestCount: number;
  auditCount: number;
}

export default function SectionTabs({ activeTab, onTabChange, requestCount, auditCount }: SectionTabsProps) {
  return (
    <div className="d-flex gap-2 border-bottom pb-3 mb-3 overflow-x-auto" style={{ width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}>
      <button
        className={`btn btn-sm d-flex align-items-center gap-1 text-nowrap px-3 py-2 rounded-pill ${
          activeTab === "bulk" 
            ? "text-white fw-bold shadow-sm" 
            : "bg-light text-muted border-0"
        }`}
        style={activeTab === "bulk" ? { backgroundColor: "#0d5173" } : {}}
        onClick={() => onTabChange("bulk")}
      >
        <Users size={16} /> Bulk Assignment
      </button>
      <button
        className={`btn btn-sm d-flex align-items-center gap-1 text-nowrap px-3 py-2 rounded-pill ${
          activeTab === "requests" 
            ? "text-white fw-bold shadow-sm" 
            : "bg-light text-muted border-0"
        }`}
        style={activeTab === "requests" ? { backgroundColor: "#0d5173" } : {}}
        onClick={() => onTabChange("requests")}
      >
        <Clock size={16} /> My Requests ({requestCount} pending)
      </button>
      <button
        className={`btn btn-sm d-flex align-items-center gap-1 text-nowrap px-3 py-2 rounded-pill ${
          activeTab === "audit" 
            ? "text-white fw-bold shadow-sm" 
            : "bg-light text-muted border-0"
        }`}
        style={activeTab === "audit" ? { backgroundColor: "#0d5173" } : {}}
        onClick={() => onTabChange("audit")}
      >
        <History size={16} /> Audit Trail ({auditCount})
      </button>
    </div>
  );
}