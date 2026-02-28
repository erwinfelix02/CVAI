import { Save } from "lucide-react";
import { useEffect, useState } from "react";

type SecuritySettingsDTO = {
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  requireEmailVerification: boolean;
};

/* ================= TOKEN HELPER ================= */
function getToken(): string | null {
  // ✅ Your SignIn stores here
  const session = localStorage.getItem("sessionToken");
  if (session && session !== "null" && session !== "undefined") return session;

  // Fallback support (if you later change storage)
  const raw = localStorage.getItem("token");
  if (raw && raw !== "null" && raw !== "undefined") return raw;

  // If stored inside auth/user object
  const authRaw = localStorage.getItem("auth") || localStorage.getItem("user");
  if (authRaw) {
    try {
      const parsed = JSON.parse(authRaw);
      return (
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.data?.token ||
        parsed?.user?.token ||
        null
      );
    } catch {
      return null;
    }
  }

  return null;
}

/* ================= COMPONENT ================= */
export default function SecuritySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [requireEmailVerification, setRequireEmailVerification] =
    useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);

  /* ================= LOAD SETTINGS ================= */
  useEffect(() => {
    const load = async () => {
      setError(null);

      const token = getToken();
      if (!token) {
        setError("No session token found. Please sign in again.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/security-settings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          setError("Session expired. Please sign in again.");
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to load security settings (${res.status})`);
        }

        const s: SecuritySettingsDTO = await res.json();
        setRequireEmailVerification(!!s.requireEmailVerification);
        setSessionTimeoutMinutes(Number(s.sessionTimeoutMinutes ?? 30));
        setMaxLoginAttempts(Number(s.maxLoginAttempts ?? 5));
      } catch (e) {
        console.error(e);
        setError("Failed to load security settings.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ================= SAVE SETTINGS ================= */
  const save = async () => {
    setSaving(true);
    setError(null);

    const token = getToken();
    if (!token) {
      setError("No session token found. Please sign in again.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/security-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requireEmailVerification,
          sessionTimeoutMinutes,
          maxLoginAttempts,
        }),
      });

      if (res.status === 401) {
        setError("Session expired. Please sign in again.");
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to save security settings (${res.status})`);
      }

      // Prevent instant logout if timeout was reduced
      localStorage.setItem("lastActivity", Date.now().toString());
    } catch (e) {
      console.error(e);
      setError("Failed to save security settings.");
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="card superadmin-settings-card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <h3 className="fw-bold mb-1">Security Settings</h3>
        <p className="text-muted mb-4">
          Configure security and authentication settings
        </p>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {loading ? (
          <div className="text-muted">Loading...</div>
        ) : (
          <>
            <div className="superadmin-settings-row mb-3">
              <div className="min-w-0">
                <div className="fw-semibold">Require Email Verification</div>
                <div className="text-muted">
                  Users must verify their email before accessing the platform
                </div>
              </div>

              <div className="superadmin-switch-wrap">
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input superadmin-switch"
                    type="checkbox"
                    checked={requireEmailVerification}
                    onChange={(e) =>
                      setRequireEmailVerification(e.target.checked)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Session Timeout (minutes)</label>
                <input
                  className="form-control"
                  type="number"
                  min={1}
                  max={1440}
                  value={sessionTimeoutMinutes}
                  onChange={(e) =>
                    setSessionTimeoutMinutes(Number(e.target.value))
                  }
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Max Login Attempts</label>
                <input
                  className="form-control"
                  type="number"
                  min={1}
                  max={20}
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                className="btn btn-primary superadmin-settings-savebtn"
                onClick={save}
                disabled={saving}
              >
                <Save size={18} className="me-2" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
