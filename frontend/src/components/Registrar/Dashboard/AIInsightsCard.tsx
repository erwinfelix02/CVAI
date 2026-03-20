import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  ShieldAlert,
  Clock,
  Users as UsersIcon,
  RefreshCw,
  MapPin,
  X,
} from "lucide-react";

type Insight = {
  key: "scam" | "oldest" | "load" | string;
  label: string;
  value: string;
  hint?: string;
};

type FlaggedItem = {
  registrationId: string;
  createdAt?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  course?: string;
  score?: number;
  reasons?: string[];
};

const iconMap: Record<string, React.ElementType> = {
  scam: ShieldAlert,
  oldest: Clock,
  load: UsersIcon,
};

export default function AIInsightsCard() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  const [showFlagged, setShowFlagged] = useState(false);
  const [flaggedLoading, setFlaggedLoading] = useState(false);
  const [flagged, setFlagged] = useState<FlaggedItem[]>([]);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);

      const start = performance.now();

      const res = await fetch(
        "http://localhost:5000/api/aiinsight/registrar-insights",
        { cache: "no-store" }
      );

      const data = await res.json();

      const end = performance.now();
      console.log(
        `Frontend AI insights fetch: ${((end - start) / 1000).toFixed(3)} sec`
      );

      setInsights(Array.isArray(data?.insights) ? data.insights : []);
      setUpdatedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to fetch AI insights", err);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFlagged = useCallback(async () => {
    try {
      setFlaggedLoading(true);
      setShowFlagged(true);

      const start = performance.now();

      const res = await fetch(
        "http://localhost:5000/api/aiinsight/registrar-flagged",
        { cache: "no-store" }
      );

      const data = await res.json();

      const end = performance.now();
      console.log(
        `Frontend flagged fetch: ${((end - start) / 1000).toFixed(3)} sec`
      );

      setFlagged(Array.isArray(data?.flagged) ? data.flagged : []);
    } catch (err) {
      console.error("Failed to fetch flagged registrations", err);
      setFlagged([]);
    } finally {
      setFlaggedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const hasInsights = useMemo(() => insights.length > 0, [insights]);

  return (
    <>
      <div className="card registrar-card shadow-sm">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
            <div className="d-flex align-items-center gap-2 min-w-0">
              <div className="registrar-stat-icon blue">
                <Sparkles size={18} />
              </div>

              <div className="min-w-0">
                <div className="fw-bold text-truncate">AI Insights</div>
                <div className="text-muted small text-truncate">
                  Scam detection + workload summary
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              <span className="text-muted small">
                {loading ? "Loading..." : updatedAt ? `Updated ${updatedAt}` : "Updated"}
              </span>

              <button
                type="button"
                className="ai-refresh-btn"
                onClick={fetchInsights}
                disabled={loading}
                title="Refresh insights"
              >
                <RefreshCw size={16} className={loading ? "spin" : ""} />
              </button>
            </div>
          </div>

          {!hasInsights && !loading ? (
            <div className="text-muted small">
              No insights yet. Add more data to generate insights.
            </div>
          ) : (
            <div className="row g-2 g-md-3">
              {insights.map((it) => {
                const Icon = iconMap[it.key] ?? UsersIcon;
                const clickable = it.key === "scam";

                return (
                  <div key={it.key} className="col-12 col-sm-6">
                    <div
                      className={`registrar-ai-tile ${clickable ? "ai-tile-clickable" : ""}`}
                      onClick={() => clickable && fetchFlagged()}
                      role={clickable ? "button" : undefined}
                      title={clickable ? "Click to view flagged registrations" : undefined}
                    >
                      <div className="d-flex align-items-center justify-content-between gap-2">
                        <div className="d-flex align-items-center gap-2 min-w-0">
                          <div className="registrar-ai-ic">
                            <Icon size={16} />
                          </div>

                          <div className="min-w-0">
                            <div className="registrar-ai-label text-truncate">
                              {it.label}
                            </div>
                            {it.hint ? (
                              <div className="registrar-ai-hint text-truncate">
                                {it.hint}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="registrar-ai-value flex-shrink-0">
                          {it.value}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-muted small mt-3">
            Tip: Click “Suspicious registrations” to view flagged accounts.
          </div>
        </div>
      </div>

      {showFlagged && (
  <div
    className="ai-modal-backdrop"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) setShowFlagged(false);
    }}
  >
          <div
            className="ai-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-bold">Flagged registrations</div>

             <button
  type="button"
  className="app-icon-btn app-icon-btn-sm"
  onClick={() => setShowFlagged(false)}
  aria-label="Close"
  title="Close"
>
  <X size={16} />
</button>
            </div>

            {flaggedLoading ? (
              <div className="text-muted small">Loading flagged list...</div>
            ) : flagged.length === 0 ? (
              <div className="text-muted small">
                No suspicious registrations found.
              </div>
            ) : (
              <div className="ai-flagged-list">
                {flagged.map((x) => (
                  <div key={x.registrationId} className="ai-flagged-item">
                    <div className="d-flex justify-content-between gap-2">
                      <div className="min-w-0">
                        <div className="fw-semibold text-truncate">
                          {x.name || "Unknown"}{" "}
                          <span className="text-muted small">
                            ({x.registrationId})
                          </span>
                        </div>

                        <div className="text-muted small">
                          {x.email || "No email"} • {x.phone || "No phone"} •{" "}
                          {x.course || "No course"}
                        </div>

                        <div className="text-muted small mt-1 d-flex align-items-start gap-1">
                          <MapPin size={14} className="flex-shrink-0 mt-1" />
                          <span>{x.address || "No address"}</span>
                        </div>

                        {!!x.reasons?.length && (
                          <div className="mt-2 d-flex flex-wrap gap-1">
                            {x.reasons.map((r) => (
                              <span
                                key={`${x.registrationId}-${r}`}
                                className="badge bg-warning text-dark"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-muted small flex-shrink-0">
                        Score: {x.score ?? 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}