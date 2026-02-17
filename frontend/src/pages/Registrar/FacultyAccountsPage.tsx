import { useState, useEffect } from "react";
import FacultyStats from "../../components/Registrar/Faculty/FacultyStats";
import FacultyToolbar from "../../components/Registrar/Faculty/FacultyToolbar";
import FacultyTable from "../../components/Registrar/Faculty/FacultyTable";
import { UserPlus } from "lucide-react";
import AddFacultyModal from "../../components/Registrar/Faculty/AddFacultyModal";
import "../../styles/faculty.css";
import SendCredentialsModal from "../../components/SuperAdmin/Users/SendCredentialsModal";
import type { Faculty } from "../../components/Registrar/Faculty/FacultyRow";
import { createUser, getUsers, sendCredentials } from "../../api/userService";
import AuthAlert from "../../components/Authentication/AuthAlert";

export default function FacultyAccountsPage() {
  const [open, setOpen] = useState(false);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [query, setQuery] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const filteredFaculty = facultyList.filter((f) => {
    const q = query.toLowerCase();

    const matchesQuery =
      f.name.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.idNumber.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && f.status === "Active") ||
      (statusFilter === "inactive" && f.status === "Inactive");

    return matchesQuery && matchesStatus;
  });
  const showAlert = (message: string, type: "success" | "error") => {
    setAnimateAlert(false);

    setTimeout(() => {
      setAlertMessage(message);
      setAlertType(type);
      setAnimateAlert(true);
    }, 50);
  };

  /* ===============================
     LOAD FACULTY FROM DATABASE
  =============================== */
  useEffect(() => {
    loadFaculty();
  }, []);

  useEffect(() => {
    if (!animateAlert) return;

    const t = setTimeout(() => {
      setAnimateAlert(false);
    }, 3000);

    return () => clearTimeout(t);
  }, [animateAlert]);

  const loadFaculty = async () => {
    try {
      const users = await getUsers();
      console.log("RAW USERS:", users);
      console.log("Is array?", Array.isArray(users));

      const facultyOnly = users
        .filter((u: any) => u.role?.toLowerCase() === "faculty")
        .map((u: any) => ({
          id: u._id,
          idNumber: u.idNumber,
          name: [u.firstName, u.middleName, u.lastName]
            .filter(Boolean)
            .join(" "),
          email: u.email,
          department: u.department,
          status:
            u.status?.toLowerCase() === "inactive" ? "Inactive" : "Active",
        }));

      setFacultyList(facultyOnly);
    } catch (err) {
      console.error("Failed to load faculty", err);
    }
  };

  const handleSendClick = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setSendOpen(true);
  };
  const confirmSendCredentials = async () => {
    if (!selectedFaculty) return;

    try {
      setIsLoading(true);

      await sendCredentials(selectedFaculty.id); // MongoDB _id

      await loadFaculty();

      setSendOpen(false);
      setSelectedFaculty(null);

      showAlert("Credentials sent and faculty activated!", "success");
    } catch (err: any) {
      showAlert(
        err.response?.data?.message || "Failed to send credentials.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ===============================
     CREATE FACULTY (DATABASE)
  =============================== */
  const handleCreateFaculty = async (data: any) => {
    try {
      setIsLoading(true);

      await createUser({
        ...data,
        role: "Faculty",
        status: "inactive",
        createdBy: "Registrar",
      });

      await loadFaculty();
      setOpen(false);

      showAlert("Faculty account created successfully!", "success");
    } catch (err: any) {
      showAlert(
        err.response?.data?.message || "Failed to create faculty.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={isLoading}
      />

      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1">Faculty Accounts</h2>
            <p className="text-muted mb-0">
              Create and manage faculty portal accounts
            </p>
          </div>

          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setOpen(true)}
          >
            <UserPlus size={18} />
            Create Faculty Account
          </button>
        </div>

        <FacultyStats />
        <FacultyToolbar
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {filteredFaculty.length > 0 ? (
          <FacultyTable
            faculty={filteredFaculty}
            onSendCredentials={handleSendClick}
          />
        ) : (
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="users-empty-state">
                <div className="users-empty-icon">📭</div>
                <h5 className="fw-semibold mb-1">No faculty accounts found</h5>
                <p className="text-muted mb-0">
                  Try creating a faculty account to get started.
                </p>
              </div>
            </div>
          </div>
        )}

        <AddFacultyModal
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={handleCreateFaculty}
          isLoading={isLoading}
        />
        <SendCredentialsModal
          open={sendOpen}
          user={
            selectedFaculty
              ? {
                  id: selectedFaculty.id,
                  name: selectedFaculty.name,
                  email: selectedFaculty.email,
                  userCode: selectedFaculty.idNumber,
                  role: "Faculty",
                  status:
                    selectedFaculty.status === "Active" ? "active" : "inactive",
                }
              : null
          }
          onClose={() => setSendOpen(false)}
          onConfirm={confirmSendCredentials}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
