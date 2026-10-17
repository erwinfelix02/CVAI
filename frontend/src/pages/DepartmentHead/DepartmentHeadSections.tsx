// ✅ src/pages/DepartmentHead/DepartmentHeadSections.tsx

import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { API_BASE_URL } from "../../config";

import SectionCards from "../../components/DepartmentHead/Sections/SectionCards";
import SectionTabs from "../../components/DepartmentHead/Sections/SectionTabs";
import BulkAssignmentTab from "../../components/DepartmentHead/Sections/BulkAssignmentTab";
import MyRequestsTab from "../../components/DepartmentHead/Sections/MyRequestsTab";
import AuditTrailTab from "../../components/DepartmentHead/Sections/AuditTrailTab";
import RequestSectionModal, {
  type NewSectionFormData,
} from "../../components/DepartmentHead/Sections/RequestSectionModal";
import AuthAlert from "../../components/Authentication/AuthAlert";

export interface Section {
  id: string;
  name: string;
  program: string;
  year: number;
  enrolled: number;
  capacity: number;
  room: string;
  adviser: string;
}

export interface StudentAssignment {
  id: string;
  name: string;
  studentNo: string;
  year: number;
  status: "Assigned" | "Unassigned";
  program: string;
  section: string;
  assignedAt: string;
  workflowState: string;
}

export interface SectionRequest {
  id: string;
  sectionName: string;
  program: string;
  year: number;
  capacity: number;
  preferredRoom: string;
  status: "Pending" | "Approved" | "Rejected";
  feedback: string;
}

export interface AuditLog {
  id: string;
  student: string;
  fromSection: string;
  toSection: string;
  assignedBy: string;
  assignedAt: string;
}

export default function DepartmentHeadSections() {
  const location = useLocation();

  const initialTab = (location.state as any)?.activeTab || "bulk";
  const [activeTab, setActiveTab] = useState<"bulk" | "requests" | "audit">(initialTab);
  
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const [alertVisible, setAlertVisible] = useState(false);

  const showAlert = (message: string, type: "error" | "success" = "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 4000);
  };

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("All Years");
  const [programFilter, setProgramFilter] = useState("All Programs");
  const [statusFilter, setStatusFilter] = useState("All Students");
  const [workflowFilter, setWorkflowFilter] = useState("All Workflows"); // 🟢 Added workflow filter state

  // Selection State
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [targetSection, setTargetSection] = useState("");

  // Sections State & Fetching
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);

  // Students, Requests & Audit Logs State
  const [students, setStudents] = useState<StudentAssignment[]>([]);
  const [requests, setRequests] = useState<SectionRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const pendingRequestsCount = useMemo(() => {
    return requests.filter((r) => r.status === "Pending").length;
  }, [requests]);

  const getReadableDate = () => {
    return new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const fetchSections = async () => {
    let userDepartment = "";
    try {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userDepartment = parsed.department || "";
      }
    } catch (e) {
      console.error("Error reading user session", e);
    }

    try {
      const sectionUrl = userDepartment
        ? `${API_BASE_URL}/sections?department=${encodeURIComponent(userDepartment)}`
        : `${API_BASE_URL}/sections`;

      const res = await fetch(sectionUrl);
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        const mappedSections: Section[] = data.map((s: any) => ({
          id: s.id || s._id,
          name: s.code || s.name,
          program: s.program,
          year: Number(s.yearLevel) || s.year || 1,
          enrolled: s.enrolled || 0,
          capacity: s.capacity || 0,
          room: s.room || "TBA",
          adviser: s.adviser || "TBA",
        }));
        setSections(mappedSections);
      }
    } catch (err) {
      console.error("Failed to load department sections:", err);
    } finally {
      setLoadingSections(false);
    }
  };

  useEffect(() => {
    fetchSections();

    const fetchDepartmentData = async () => {
      let userDepartment = "";
      try {
        const storedUser =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          userDepartment = parsed.department || "";
        }
      } catch (e) {
        console.error("Error reading user session", e);
      }

      try {
        const auditUrl = userDepartment
          ? `${API_BASE_URL}/audit-logs?department=${encodeURIComponent(userDepartment)}`
          : `${API_BASE_URL}/audit-logs`;

        const res = await fetch(auditUrl);
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          const mappedLogs: AuditLog[] = data.map((l: any) => ({
            id: l.id || l._id,
            student: l.student,
            fromSection: l.fromSection || "—",
            toSection: l.toSection,
            assignedBy: l.assignedBy,
            assignedAt: l.assignedAt,
          }));
          setAuditLogs(mappedLogs);
        }
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      }

      try {
        const requestUrl = userDepartment
          ? `${API_BASE_URL}/section-requests?department=${encodeURIComponent(userDepartment)}`
          : `${API_BASE_URL}/section-requests`;

        const res = await fetch(requestUrl);
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          const mappedRequests: SectionRequest[] = data.map((r: any) => ({
            id: r.id || r._id,
            sectionName: r.sectionName,
            program: r.program,
            year: Number(r.yearLevel) || r.year || 1,
            capacity: r.requestedCapacity || r.capacity || 40,
            preferredRoom: r.preferredRoom || "—",
            status: r.status || "Pending",
            feedback:
              r.feedback ||
              (r.status === "Pending"
                ? "Awaiting Registrar review"
                : "Reviewed by Registrar"),
          }));
          setRequests(mappedRequests);
        }
      } catch (err) {
        console.error("Failed to load section requests:", err);
      }

      try {
        const studentUrl = userDepartment
          ? `${API_BASE_URL}/students?department=${encodeURIComponent(userDepartment)}`
          : `${API_BASE_URL}/students`;

        const res = await fetch(studentUrl);
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          const mappedStudents: StudentAssignment[] = data.map((st: any) => ({
            id: st.id || st._id,
            name: st.name,
            studentNo: st.studentIdNumber || st.id || "—",
            year: st.year || st.yearLevel || 1,
            status:
              st.section && st.section !== "—" && st.section !== ""
                ? "Assigned"
                : "Unassigned",
            program: st.program || st.course || "—",
            section: st.section && st.section !== "" ? st.section : "—",
            assignedAt: st.assignedAt || "—",
            workflowState: st.workflowState || "None",
          }));
          setStudents(mappedStudents);
        }
      } catch (err) {
        console.error("Failed to load department students:", err);
      }
    };

    fetchDepartmentData();
  }, []);

  const uniquePrograms = useMemo(() => {
    const progs = students.map((s) => s.program);
    return Array.from(new Set(progs));
  }, [students]);

  const handleSelectAll = (
    e: React.ChangeEvent<HTMLInputElement>,
    filteredIds: string[],
  ) => {
    if (e.target.checked) {
      const validIds = filteredIds.filter((id) => {
        const s = students.find((st) => st.id === id);
        return s && s.workflowState === "None";
      });
      setSelectedStudents(validIds);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (id: string) => {
    const studentObj = students.find((s) => s.id === id);
    if (studentObj && studentObj.workflowState !== "None") {
      showAlert(`Cannot select student. Active workflow state: "${studentObj.workflowState}".`, "error");
      return;
    }
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleTargetSectionChange = (sectionName: string) => {
    setTargetSection(sectionName);
    if (!sectionName) return;

    const selectedSec = sections.find((s) => s.name === sectionName);
    if (!selectedSec) return;

    const availableSlots = Math.max(
      0,
      selectedSec.capacity - selectedSec.enrolled,
    );
    if (availableSlots === 0) {
      showAlert(`Section ${sectionName} is already at full capacity!`, "error");
      return;
    }

    const matchingUnassigned = students.filter(
      (s) =>
        s.program === selectedSec.program &&
        s.year === selectedSec.year &&
        s.status === "Unassigned" &&
        s.workflowState === "None",
    );

    const targetIds = matchingUnassigned
      .slice(0, availableSlots)
      .map((s) => s.id);
    setSelectedStudents(targetIds);

    if (matchingUnassigned.length > 0) {
      showAlert(
        `Auto-selected ${targetIds.length} available unassigned student(s) for ${selectedSec.name} (${selectedSec.program} Yr ${selectedSec.year}).`,
        "success",
      );
    } else {
      showAlert(
        `No unassigned students found matching ${selectedSec.program} Year ${selectedSec.year}.`,
        "error",
      );
    }
  };

  const handleAutoSelectByProgram = () => {
    if (programFilter === "All Programs") {
      showAlert(
        "Please select a specific program first before auto-selecting.",
        "error",
      );
      return;
    }

    if (yearFilter === "All Years") {
      showAlert(
        "Please select a specific Year Level (e.g., Year 1) to auto-select students for that section.",
        "error",
      );
      return;
    }

    const selectedSectionObj = sections.find(
      (sec) => sec.name === targetSection,
    );
    const availableSlots = selectedSectionObj
      ? Math.max(0, selectedSectionObj.capacity - selectedSectionObj.enrolled)
      : Infinity;

    if (selectedSectionObj && availableSlots === 0) {
      showAlert(
        `The target section (${targetSection}) is already at full capacity!`,
        "error",
      );
      return;
    }

    const matchingStudents = students.filter((s) => {
      const matchesProg = s.program === programFilter;
      const matchesYear = s.year.toString() === yearFilter.replace("Year ", "");
      const matchesStatus =
        statusFilter === "All Students"
          ? s.status === "Unassigned"
          : s.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesWorkflow = s.workflowState === "None";
      return matchesProg && matchesYear && matchesStatus && matchesWorkflow;
    });

    if (matchingStudents.length === 0) {
      showAlert(
        `No matching unassigned students found for ${programFilter} (${yearFilter}).`,
        "error",
      );
      return;
    }

    const constrainedStudents = selectedSectionObj
      ? matchingStudents.slice(0, availableSlots)
      : matchingStudents;

    const matchingIds = constrainedStudents.map((s) => s.id);
    setSelectedStudents(matchingIds);

    if (selectedSectionObj && matchingStudents.length > availableSlots) {
      showAlert(
        `Auto-selected ${matchingIds.length} students (capped to match remaining room capacity of ${availableSlots} slots in ${targetSection}).`,
        "success",
      );
    }
  };

  const handleAssignSelected = async () => {
    if (!targetSection || selectedStudents.length === 0) return;

    const selectedSectionObj = sections.find(
      (sec) => sec.name === targetSection,
    );
    if (!selectedSectionObj) {
      showAlert("Selected target section not found.", "error");
      return;
    }

    let userDepartment = "";
    try {
      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (stored) userDepartment = JSON.parse(stored).department || "";
    } catch (e) {}

    try {
      const timestamp = getReadableDate();
      const newLogs: AuditLog[] = [];

      for (const studentId of selectedStudents) {
        const studentObj = students.find((s) => s.id === studentId);
        if (!studentObj) continue;

        if (studentObj.workflowState !== "None") {
          throw new Error(`Cannot assign ${studentObj.name}. Active workflow state: "${studentObj.workflowState}".`);
        }

        const res = await fetch(
          `${API_BASE_URL}/students/${encodeURIComponent(studentObj.studentNo)}`,
          {
            method: "PUT",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({
              section: targetSection,
              updatedBy: "Department Head",
              assignedAt: timestamp,
            }),
          },
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(
            errData.message || `Failed to assign student ${studentObj.name}`,
          );
        }

        const auditRes = await fetch(`${API_BASE_URL}/audit-logs`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            department: userDepartment || "General Department",
            student: studentObj.name,
            fromSection: studentObj.section || "—",
            toSection: targetSection,
            assignedBy: "Department Head",
            assignedAt: timestamp,
          }),
        });
        const auditData = await auditRes.json();
        if (auditRes.ok && auditData.log) {
          newLogs.push({
            id: auditData.log.id || auditData.log._id,
            student: auditData.log.student,
            fromSection: auditData.log.fromSection,
            toSection: auditData.log.toSection,
            assignedBy: auditData.log.assignedBy,
            assignedAt: auditData.log.assignedAt,
          });
        }
      }

      setStudents((prev) =>
        prev.map((s) => {
          if (selectedStudents.includes(s.id)) {
            return {
              ...s,
              section: targetSection,
              status: "Assigned",
              assignedAt: timestamp,
            };
          }
          return s;
        }),
      );

      setAuditLogs((prev) => [...newLogs, ...prev]);
      setSelectedStudents([]);
      setTargetSection("");

      await fetchSections();
      showAlert("Students assigned successfully!", "success");
    } catch (err: any) {
      console.error("Assignment error:", err);
      showAlert(err.message || "Failed to assign students.", "error");
    }
  };

  const handleUnassignSelected = async () => {
    if (selectedStudents.length === 0) return;

    let userDepartment = "";
    try {
      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (stored) userDepartment = JSON.parse(stored).department || "";
    } catch (e) {}

    try {
      const timestamp = getReadableDate();
      const newLogs: AuditLog[] = [];

      for (const studentId of selectedStudents) {
        const studentObj = students.find((s) => s.id === studentId);
        if (!studentObj) continue;

        const res = await fetch(
          `${API_BASE_URL}/students/${encodeURIComponent(studentObj.studentNo)}`,
          {
            method: "PUT",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({
              section: "",
              updatedBy: "Department Head",
              assignedAt: "—",
            }),
          },
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(
            errData.message || `Failed to unassign student ${studentObj.name}`,
          );
        }

        const auditRes = await fetch(`${API_BASE_URL}/audit-logs`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            department: userDepartment || "General Department",
            student: studentObj.name,
            fromSection: studentObj.section || "—",
            toSection: "—",
            assignedBy: "Department Head",
            assignedAt: timestamp,
          }),
        });
        const auditData = await auditRes.json();
        if (auditRes.ok && auditData.log) {
          newLogs.push({
            id: auditData.log.id || auditData.log._id,
            student: auditData.log.student,
            fromSection: auditData.log.fromSection,
            toSection: auditData.log.toSection,
            assignedBy: auditData.log.assignedBy,
            assignedAt: auditData.log.assignedAt,
          });
        }
      }

      setStudents((prev) =>
        prev.map((s) => {
          if (selectedStudents.includes(s.id)) {
            return {
              ...s,
              section: "—",
              status: "Unassigned",
              assignedAt: "—",
            };
          }
          return s;
        }),
      );

      setAuditLogs((prev) => [...newLogs, ...prev]);
      setSelectedStudents([]);

      await fetchSections();
      showAlert("Students unassigned successfully!", "success");
    } catch (err: any) {
      console.error("Unassignment error:", err);
      showAlert(err.message || "Failed to unassign students.", "error");
    }
  };

  const handleSubmitRequest = async (formData: NewSectionFormData) => {
    try {
      let userId = "";
      try {
        const storedUser =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          userId = parsed.id || parsed._id || "";
        }
      } catch (e) {
        console.error("Error reading user session", e);
      }

      const payload = {
        department: formData.department || "General Department",
        program: formData.program,
        yearLevel: parseInt(formData.yearLevel.replace("Year ", "")) || 1,
        sectionName: formData.sectionName,
        requestedCapacity: formData.capacity,
        preferredRoom: formData.preferredRoom,
        reason: formData.reason,
        requestedBy: userId || undefined,
      };

      const res = await fetch(`${API_BASE_URL}/section-requests`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        const newReq: SectionRequest = {
          id: data.request?._id || data.request?.id || `r${Date.now()}`,
          sectionName: formData.sectionName,
          program: formData.program,
          year: parseInt(formData.yearLevel.replace("Year ", "")) || 1,
          capacity: formData.capacity,
          preferredRoom: formData.preferredRoom,
          status: "Pending",
          feedback: "Awaiting Registrar review",
        };
        setRequests([newReq, ...requests]);
        setShowRequestModal(false);
        showAlert("Section request submitted successfully!", "success");
      } else {
        showAlert(data.message || "Failed to submit section request.", "error");
      }
    } catch (err) {
      console.error("Submit section request error:", err);
      showAlert("Network error while submitting request.", "error");
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.program.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesYear =
        yearFilter === "All Years" ||
        s.year.toString() === yearFilter.replace("Year ", "");

      const matchesProgram =
        programFilter === "All Programs" || s.program === programFilter;

      const matchesStatus =
        statusFilter === "All Students" ||
        s.status.toLowerCase() === statusFilter.toLowerCase();

      // 🟢 Matches workflow filter logic
      const matchesWorkflow =
        workflowFilter === "All Workflows" ||
        s.workflowState === workflowFilter;

      return matchesSearch && matchesYear && matchesProgram && matchesStatus && matchesWorkflow;
    });
  }, [students, searchQuery, yearFilter, programFilter, statusFilter, workflowFilter]);

  return (
    <div
      className="rooms-page position-relative"
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        className="rooms-page-content"
        style={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          overflowX: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3"
          style={{ minWidth: 0 }}
        >
          <div>
            <h1 className="fw-bold mb-1 fs-3 fs-md-2">Section Management</h1>
            <p className="text-muted mb-0">
              Request new sections from the Registrar and place students into
              approved sections
            </p>
          </div>
          <button
            type="button"
            className="btn text-white d-flex align-items-center gap-2 align-self-start align-self-md-auto text-nowrap border-0 shadow-sm"
            style={{ backgroundColor: "#0d5173" }}
            onClick={() => setShowRequestModal(true)}
          >
            <Plus size={19} /> Request New Section
          </button>
        </div>

        <div className="mb-3">
          <AuthAlert
            message={alertMessage}
            type={alertType}
            visible={alertVisible}
            loading={false}
          />
        </div>

        {loadingSections ? (
          <div className="text-center py-4 text-muted small">
            Loading sections...
          </div>
        ) : (
          <SectionCards sections={sections} />
        )}

        <SectionTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          requestCount={pendingRequestsCount}
          auditCount={auditLogs.length}
        />

        {activeTab === "bulk" && (
          <BulkAssignmentTab
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            yearFilter={yearFilter}
            onYearFilterChange={setYearFilter}
            programFilter={programFilter}
            onProgramFilterChange={setProgramFilter}
            uniquePrograms={uniquePrograms}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            workflowFilter={workflowFilter} // 🟢 Passed workflowFilter
            onWorkflowFilterChange={setWorkflowFilter} // 🟢 Passed handler
            selectedStudents={selectedStudents}
            targetSection={targetSection}
            onTargetSectionChange={handleTargetSectionChange}
            sections={sections}
            filteredStudents={filteredStudents}
            students={students}
            onSelectAll={(e) =>
              handleSelectAll(
                e,
                filteredStudents.map((s) => s.id),
              )
            }
            onSelectStudent={handleSelectStudent}
            onAutoSelectByProgram={handleAutoSelectByProgram}
            onAssignSelected={handleAssignSelected}
            onUnassignSelected={handleUnassignSelected}
          />
        )}

        {activeTab === "requests" && (
          <MyRequestsTab 
            requests={requests} 
            onRequestDeleted={(deletedId) => {
              setRequests((prev) => prev.filter((r) => r.id !== deletedId));
            }}
          />
        )}

        {activeTab === "audit" && <AuditTrailTab auditLogs={auditLogs} />}

        <RequestSectionModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSubmit={handleSubmitRequest}
        />
      </div>
    </div>
  );
}