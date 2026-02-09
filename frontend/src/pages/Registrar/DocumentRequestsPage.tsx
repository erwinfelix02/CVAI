import { useMemo, useState } from "react";
import {
  Clock,
  FileText,
  CheckCircle2,
  Files,
} from "lucide-react";

import DocStatsRow from "../../components/Registrar/Documents/DocStatsRow";
import DocToolbar from "../../components/Registrar/Documents/DocToolbar";
import DocTabs from "../../components/Registrar/Documents/DocTabs";
import DocRequestsTable from "../../components/Registrar/Documents/DocRequestsTable";

import type { DocRequest, DocStatus } from "../../components/Registrar/Documents/types";

import "../../styles/registrar-documents.css";

export default function DocumentRequestsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All Status" | DocStatus>("All Status");
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Ready">("All");

  const rows = useMemo<DocRequest[]>(
    () => [
      {
        id: "DOC-001",
        studentName: "Maria Santos",
        studentNo: "2024-00001",
        documentName: "Transcript of Records",
        purpose: "Employment",
        copies: 2,
        fee: 150,
        status: "Pending",
      },
      {
        id: "DOC-002",
        studentName: "Juan Dela Cruz",
        studentNo: "2024-00002",
        documentName: "Certificate of Enrollment",
        purpose: "Scholarship",
        copies: 1,
        fee: 50,
        status: "Processing",
      },
      {
        id: "DOC-003",
        studentName: "Ana Reyes",
        studentNo: "2023-00045",
        documentName: "Good Moral Certificate",
        purpose: "Transfer",
        copies: 1,
        fee: 50,
        status: "Ready",
      },
    ],
    []
  );

  const counts = useMemo(() => {
    const pending = rows.filter((r) => r.status === "Pending").length;
    const processing = rows.filter((r) => r.status === "Processing").length;
    const ready = rows.filter((r) => r.status === "Ready").length;
    const total = rows.length;
    return { pending, processing, ready, total };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((r) => {
      const matchQuery =
        q.length === 0
          ? true
          : `${r.id} ${r.studentName} ${r.studentNo} ${r.documentName} ${r.purpose}`
              .toLowerCase()
              .includes(q);

      const matchStatus =
        statusFilter === "All Status" ? true : r.status === statusFilter;

      const matchTab =
        activeTab === "All"
          ? true
          : activeTab === "Pending"
          ? r.status === "Pending"
          : r.status === "Ready";

      return matchQuery && matchStatus && matchTab;
    });
  }, [rows, query, statusFilter, activeTab]);

  const onView = (id: string) => {
    alert(`View request ${id} (connect to your modal/page)`);
  };

  return (
    <div className="registrar-docs-page">
      {/* Header */}
      <div className="mb-3 mb-md-4">
        <h2 className="fw-bold mb-1">Document Requests</h2>
        <p className="text-muted mb-0">Process and manage student document requests</p>
      </div>

      {/* Stats */}
      <DocStatsRow
        items={[
          { label: "Pending", value: counts.pending, icon: Clock, tone: "warning" },
          { label: "Processing", value: counts.processing, icon: FileText, tone: "primary" },
          { label: "Ready for Pickup", value: counts.ready, icon: CheckCircle2, tone: "success" },
          { label: "Total Requests", value: counts.total, icon: Files, tone: "muted" },
        ]}
      />

      {/* Toolbar */}
      <DocToolbar
        query={query}
        onQueryChange={setQuery}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={["All Status", "Pending", "Processing", "Ready"]}
      />

      {/* Tabs */}
      <DocTabs
        active={activeTab}
        onChange={setActiveTab}
        counts={{ pending: counts.pending, ready: counts.ready }}
      />

      {/* Table */}
      <DocRequestsTable rows={filteredRows} onView={onView} />
    </div>
  );
}
