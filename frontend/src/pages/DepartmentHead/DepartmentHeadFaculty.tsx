// ✅ src/pages/DepartmentHead/DepartmentHeadFaculty.tsx

import { useMemo, useState, useEffect, useCallback } from "react";
import { Users, Clock3, BookOpen, Download, Loader2 } from "lucide-react";

import FacultyStats, {
  type FacultyStatItem,
} from "../../components/DepartmentHead/Faculty/FacultyStats";
import FacultySearch from "../../components/DepartmentHead/Faculty/FacultySearch";
import FacultyCard, {
  type FacultyRow,
} from "../../components/DepartmentHead/Faculty/FacultyCard";
import FacultyDetailsModal from "../../components/DepartmentHead/Faculty/FacultyDetailsModal";
import GenerateReportModal from "../../components/DepartmentHead/Faculty/GenerateReportModal";

import { API_BASE_URL } from "../../config";
import "../../styles/department-headFaculty.css";

export default function DepartmentHeadFaculty() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedTerm, setSelectedTerm] = useState("1st Sem, A.Y. 2026-2027");

  const [facultyList, setFacultyList] = useState<FacultyRow[]>([]);
  const [availableTerms, setAvailableTerms] = useState<string[]>(["1st Sem, A.Y. 2026-2027"]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const currentUser = useMemo(() => {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
  }, []);

  const userDepartment = currentUser?.department || "";
  const userEmail = currentUser?.email || "";

  const fetchFacultyData = useCallback(async () => {
    setIsLoading(true);
    const queryParam = userDepartment
      ? `?department=${encodeURIComponent(userDepartment)}`
      : "";
    const meQueryParam = userEmail
      ? `?email=${encodeURIComponent(userEmail)}`
      : "";

    const [semesterPart, yearPart] = selectedTerm.split(", A.Y. ");
    const termQuery = `&semester=${encodeURIComponent(semesterPart?.trim() || "")}&year=${encodeURIComponent(yearPart?.trim() || "")}`;

    try {
      // Also fetch ALL schedules/subjects without strict term filters to compute available terms
      const [meRes, facultyRes, schedulesRes, subjectsRes, allSchedulesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/me${meQueryParam}`),
        fetch(`${API_BASE_URL}/users/faculty${queryParam}`),
        fetch(`${API_BASE_URL}/schedules${queryParam}${termQuery}`),
        fetch(`${API_BASE_URL}/subjects${queryParam}${termQuery}`),
        fetch(`${API_BASE_URL}/schedules${queryParam}`), // Fetch all department schedules to aggregate available terms
      ]);

      const meData = meRes.ok ? await meRes.json() : null;
      const rawFaculty = facultyRes.ok ? await facultyRes.json() : [];
      const rawSchedules = schedulesRes.ok ? await schedulesRes.json() : [];
      const rawSubjects = subjectsRes.ok ? await subjectsRes.json() : [];
      const allSchedules = allSchedulesRes.ok ? await allSchedulesRes.json() : [];

      // Extract unique terms (semester + year) present in database records
      const termSet = new Set<string>();
      if (Array.isArray(allSchedules)) {
        allSchedules.forEach((sch: any) => {
          if (sch.semester && sch.year) {
            termSet.add(`${sch.semester}, A.Y. ${sch.year}`);
          }
        });
      }
      
      // Fallback to default if no terms found
      if (termSet.size > 0) {
        setAvailableTerms(Array.from(termSet));
      }

      let deptMaxUnits = 21;
      if (meData?.maxUnits) {
        const parsedUnits = parseInt(meData.maxUnits, 10);
        if (!isNaN(parsedUnits) && parsedUnits > 0) {
          deptMaxUnits = parsedUnits;
        }
      }

      const subjectUnitsMap = new Map<string, number>();
      if (Array.isArray(rawSubjects)) {
        rawSubjects.forEach((sub: any) => {
          if (sub.code) {
            subjectUnitsMap.set(sub.code.trim().toUpperCase(), sub.units || 3);
          }
        });
      }

      const mappedFaculty: FacultyRow[] = (
        Array.isArray(rawFaculty) ? rawFaculty : []
      ).map((member: any, index: number) => {
        const facultyName =
          member.name ||
          `${member.firstName || ""} ${member.lastName || ""}`.trim();

        const assignedSchedules = Array.isArray(rawSchedules)
          ? rawSchedules.filter(
              (sch: any) =>
                sch.faculty?.trim().toLowerCase() ===
                facultyName.trim().toLowerCase(),
            )
          : [];

        const subjects = Array.from(
          new Set(
            assignedSchedules.map((sch: any) => sch.code).filter(Boolean),
          ),
        );

        const currentLoad = assignedSchedules.reduce(
          (acc: number, sch: any) => {
            const units =
              subjectUnitsMap.get(sch.code?.trim().toUpperCase()) || 3;
            return acc + units;
          },
          0,
        );

        const maxLoad = member.maxLoad || deptMaxUnits;

        let loadStatus: "Available" | "Full Load" | "Overloaded" = "Available";
        if (currentLoad > maxLoad) {
          loadStatus = "Overloaded";
        } else if (currentLoad === maxLoad) {
          loadStatus = "Full Load";
        }

        const names = facultyName.split(" ").filter(Boolean);
        const initials =
          names.length >= 2
            ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
            : facultyName.slice(0, 2).toUpperCase() || "FA";

        return {
          id: member._id || member.id || index + 1,
          initials,
          name: facultyName,
          position: member.position || member.role || "Faculty Member",
          specialization:
            member.specialization ||
            member.department ||
            userDepartment ||
            "General",
          email: member.email || "N/A",
          subjects,
          currentLoad,
          maxLoad,
          status: loadStatus,
        };
      });

      setFacultyList(mappedFaculty);
    } catch (err) {
      console.error("Error fetching department faculty data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userDepartment, userEmail, selectedTerm]);

  useEffect(() => {
    fetchFacultyData();
  }, [fetchFacultyData]);

  const stats = useMemo<FacultyStatItem[]>(() => {
    const totalFaculty = facultyList.length;
    const totalUnits = facultyList.reduce((acc, f) => acc + f.currentLoad, 0);
    const available = facultyList.filter(
      (f) => f.status === "Available",
    ).length;
    const overloaded = facultyList.filter(
      (f) => f.status === "Overloaded",
    ).length;

    return [
      { label: "Total Faculty", value: totalFaculty, icon: Users },
      { label: "Total Units Assigned", value: totalUnits, icon: Clock3 },
      { label: "Available for Load", value: available, icon: BookOpen },
      { label: "Overloaded", value: overloaded, icon: Clock3 },
    ];
  }, [facultyList]);

  const filteredFaculty = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return facultyList.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.specialization.toLowerCase().includes(keyword) ||
        item.position.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        item.subjects.some((subject) =>
          subject.toLowerCase().includes(keyword),
        );

      const matchesStatus = status === "All" || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [facultyList, search, status]);

  return (
    <div className="container-fluid py-3 py-md-4 faculty-page">
      <div className="faculty-page-header mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h1 className="fw-bold mb-1">Faculty Management</h1>
          <p className="text-muted mb-0">
            {userDepartment
              ? `Department of ${userDepartment} — Teaching loads and faculty assignments`
              : "Monitor teaching loads and faculty assignments"}
          </p>
        </div>

        <button
          type="button"
          className="btn faculty-report-btn d-inline-flex align-items-center gap-2"
          onClick={() => setIsReportModalOpen(true)}
          disabled={isLoading}
        >
          <Download size={19} />
          <span>Generate Load Report</span>
        </button>
      </div>

      <FacultyStats items={stats} />

      <div className="faculty-filter-card mb-4">
        <FacultySearch
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />
      </div>

      <div className="faculty-list">
        {isLoading ? (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <Loader2 className="spinner-border spinner-border-sm text-primary" size={20} />
              <span className="fw-medium">Loading department faculty members...</span>
            </div>
          </div>
        ) : filteredFaculty.length > 0 ? (
          filteredFaculty.map((item) => (
            <FacultyCard
              key={item.id}
              faculty={item}
              onView={(faculty) => {
                setSelectedFaculty(faculty);
                setIsModalOpen(true);
              }}
            />
          ))
        ) : (
          <div className="faculty-empty-state card border-0 shadow-sm p-5 text-center">
            <Users size={42} className="mx-auto text-secondary mb-3" />
            <h5 className="fw-semibold mb-1">No faculty found</h5>
            <p className="text-muted mb-0">
              {search || status !== "All"
                ? "Try changing your search keywords or status filter."
                : `No faculty records found under the ${userDepartment || "current"} department.`}
            </p>
          </div>
        )}
      </div>

      <FacultyDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFaculty(null);
        }}
        faculty={selectedFaculty}
      />

      <GenerateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        facultyList={facultyList}
        departmentName={userDepartment}
        currentTerm={selectedTerm}
        onTermChange={setSelectedTerm}
        availableTerms={availableTerms}
      />
    </div>
  );
}