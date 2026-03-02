import { useState, useEffect, useMemo } from "react";
import FacultyStats from "../../components/Registrar/Faculty/FacultyStats";
import FacultyToolbar from "../../components/Registrar/Faculty/FacultyToolbar";
import FacultyTable from "../../components/Registrar/Faculty/FacultyTable";
import { UserPlus } from "lucide-react";
import AddFacultyModal from "../../components/Registrar/Faculty/AddFacultyModal";
import "../../styles/faculty.css";
import SendCredentialsModal from "../../components/SuperAdmin/Users/SendCredentialsModal";
import type { Faculty } from "../../components/Registrar/Faculty/FacultyRow";
import {
  createUser,
  getUsers,
  sendCredentials,
  getUserById,
  updateUser,
} from "../../api/userService";
import AuthAlert from "../../components/Authentication/AuthAlert";
import FacultyDetailsModal from "../../components/Registrar/Faculty/FacultyDetailsModal";
import EditFacultyModal from "../../components/Registrar/Faculty/EditFacultyModal";

/** ✅ FULL FACULTY (FROM DATABASE) */
type FacultyDB = {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  gender: string;
  role: string;
  status: "active" | "inactive";
  department: string;
  notes?: string;
  createdBy?: string;
  credentialsSent?: boolean;
  isTemporaryPassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function FacultyAccountsPage() {
  const [open, setOpen] = useState(false);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);

  const stats = useMemo(() => {
    const total = facultyList.length;
    const active = facultyList.filter((f) => f.status === "Active").length;
    const inactive = facultyList.filter((f) => f.status === "Inactive").length;
    return { total, active, inactive };
  }, [facultyList]);

  const [isLoading, setIsLoading] = useState(false);

  const [sendOpen, setSendOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  // ✅ DETAILS MODAL STATE
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [facultyDetails, setFacultyDetails] = useState<FacultyDB | null>(null);

  // ✅ EDIT MODAL STATE
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFaculty, setEditFaculty] = useState<{
    id: string;
    name: string;
    email: string;
    idNumber: string;
    phone?: string;
    department?: string;
    status?: "active" | "inactive";
  } | null>(null);

  const [query, setQuery] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

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

  useEffect(() => {
    loadFaculty();
  }, []);

  useEffect(() => {
    if (!animateAlert) return;
    const t = setTimeout(() => setAnimateAlert(false), 3000);
    return () => clearTimeout(t);
  }, [animateAlert]);

  const loadFaculty = async () => {
    try {
      const users = await getUsers();

     const facultyOnly: Faculty[] = users
  .filter((u: any) => u.role?.toLowerCase() === "faculty")
  .map((u: any) => {
    const status: Faculty["status"] =
      u.status?.toLowerCase() === "inactive" ? "Inactive" : "Active";

    return {
      id: u._id,
      idNumber: u.idNumber,
      name: [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" "),
      email: u.email,
      department: u.department,
      phone: u.phone,
      credentialsSent: !!u.credentialsSent,
      status, // ✅ now typed as "Active" | "Inactive"
    };
  });

setFacultyList(facultyOnly);
    } catch (err: any) {
      console.error("Failed to load faculty", err);
      showAlert(err?.message || "Failed to load faculty.", "error");
    }
  };

  const handleSendClick = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setSendOpen(true);
  };

  // ✅ View details
  const handleViewDetails = async (faculty: Faculty) => {
    try {
      setDetailsOpen(true);
      setDetailsLoading(true);
      setFacultyDetails(null);

      const full = await getUserById(faculty.id);
      setFacultyDetails(full);
    } catch (err: any) {
      showAlert(err?.message || "Failed to load faculty details.", "error");
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ✅ Edit (only if credentials already sent)
  const handleEditClick = async (faculty: Faculty) => {
    if (!faculty.credentialsSent) {
      showAlert("You can edit only after credentials are sent.", "error");
      return;
    }

    try {
      setEditOpen(true);
      setEditLoading(true);
      setEditFaculty(null);

      const full: FacultyDB = await getUserById(faculty.id);

      setEditFaculty({
        id: full._id,
        name: [full.firstName, full.middleName, full.lastName].filter(Boolean).join(" "),
        email: full.email,
        idNumber: full.idNumber,
        phone: full.phone,
        department: full.department,
        status: full.status, // displayed only in edit modal (not editable)
      });
    } catch (err: any) {
      showAlert(err?.message || "Failed to load faculty for editing.", "error");
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const confirmSendCredentials = async () => {
    if (!selectedFaculty) return;

    try {
      setIsLoading(true);

      await sendCredentials(selectedFaculty.id);
      await loadFaculty();

      setSendOpen(false);
      setSelectedFaculty(null);

      showAlert("Credentials sent and faculty activated!", "success");
    } catch (err: any) {
      showAlert(err?.message || "Failed to send credentials.", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
      showAlert(err?.message || "Failed to create faculty.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Save edits (ONLY phone + department)
  const handleSaveEdits = async (payload: { phone: string; department: string }) => {
    if (!editFaculty) return;

    try {
      setIsLoading(true);

      await updateUser(editFaculty.id, payload);
      await loadFaculty();

      setEditOpen(false);
      setEditFaculty(null);

      showAlert("Faculty account updated successfully!", "success");
    } catch (err: any) {
      showAlert(err?.message || "Failed to update faculty.", "error");
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
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1">Faculty Accounts</h2>
            <p className="text-muted mb-0">Create and manage faculty portal accounts</p>
          </div>

          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setOpen(true)}
          >
            <UserPlus size={18} />
            Create Faculty Account
          </button>
        </div>

        <FacultyStats total={stats.total} active={stats.active} inactive={stats.inactive} />

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
            onViewDetails={handleViewDetails}
            onEdit={handleEditClick}
          />
        ) : (
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="users-empty-state">
                <div className="users-empty-icon">📭</div>
                <h5 className="fw-semibold mb-1">No faculty accounts found</h5>
                <p className="text-muted mb-0">Try creating a faculty account to get started.</p>
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
                  status: selectedFaculty.status === "Active" ? "active" : "inactive",
                }
              : null
          }
          onClose={() => setSendOpen(false)}
          onConfirm={confirmSendCredentials}
          isLoading={isLoading}
        />

        <FacultyDetailsModal
          open={detailsOpen}
          faculty={facultyDetails}
          loading={detailsLoading}
          onClose={() => setDetailsOpen(false)}
        />

        <EditFacultyModal
          open={editOpen}
          faculty={editFaculty}
          loading={editLoading}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveEdits} // ✅ now only phone+department
          isSaving={isLoading}
        />
      </div>
    </>
  );
}