// src/components/SuperAdmin/Knowledge/FaqList.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Pencil, Trash2, HelpCircle } from "lucide-react";
import type { FaqItem } from "./types";
import AuthAlert from "../../Authentication/AuthAlert";

type Props = {
  items: FaqItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
};

export default function FaqList({ items, onEdit, onDelete }: Props) {
  const firstId = useMemo(() => items[0]?.id ?? null, [items]);
  const [openId, setOpenId] = useState<string | null>(firstId);

  // keep openId valid when items change
  useEffect(() => {
    if (!items.length) {
      setOpenId(null);
      return;
    }
    if (openId && items.some((x) => x.id === openId)) return;
    setOpenId(items[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // delete confirmation modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const selectedFaq = useMemo(
    () => items.find((x) => x.id === deleteId) || null,
    [items, deleteId],
  );

  // loading + prevent double actions
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // alert state (modal-safe)
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [visible, setVisible] = useState(false);

  const closeTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    closeTimerRef.current = null;
    hideTimerRef.current = null;
    rafRef.current = null;
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // reset alert when opening modal (so previous message doesn't carry over)
  useEffect(() => {
    if (!deleteId) return;
    clearTimers();
    setAlertMessage("");
    setVisible(false);
    setAlertType("success");
    setLoading(false);
    setIsClosing(false);
  }, [deleteId]);

  const showAlert = (message: string, type: "success" | "error") => {
    clearTimers();

    setAlertMessage(message);
    setAlertType(type);

    // force re-trigger animation reliably
    setVisible(false);
    rafRef.current = window.requestAnimationFrame(() => setVisible(true));

    // auto-hide the alert (optional)
    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, 3500);
  };

  /**
   * ✅ Key change:
   * Show success FIRST, then delay the actual delete call.
   * This prevents the parent list from re-rendering immediately and “skipping” the alert.
   */
  const confirmDelete = async () => {
    if (!deleteId) return;
    if (loading || isClosing) return;

    const idToDelete = deleteId;

    try {
      setLoading(true);
      setIsClosing(true);

      // ✅ show success first (inside modal)
      showAlert("FAQ deleted successfully.", "success");

      // ✅ delay the actual delete so the alert is visible
      closeTimerRef.current = window.setTimeout(async () => {
        try {
          await onDelete(idToDelete);

          // if you deleted currently open item, close it
          if (openId === idToDelete) setOpenId(null);
        } catch (err: any) {
          console.error(err);
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to delete FAQ.";
          showAlert(msg, "error");
          setIsClosing(false);
          setLoading(false);
          return;
        }

        // ✅ close modal after delete completes
        setDeleteId(null);
        setIsClosing(false);
        setLoading(false);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message || err?.message || "Failed to delete FAQ.";
      showAlert(msg, "error");
      setIsClosing(false);
      setLoading(false);
    }
  };

  const disableActions = loading || isClosing;

  if (items.length === 0) {
    return <div className="text-muted text-center py-5">No FAQs found.</div>;
  }

  return (
    <>
      <div className="d-flex flex-column gap-3">
        {items.map((f) => {
          const open = openId === f.id;

          return (
            <div key={f.id} className="card superadmin-kb-faq shadow-sm">
              <div className="card-body p-3 p-md-4">
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-3 min-w-0">
                    <div className="superadmin-kb-faq-ic">
                      <HelpCircle size={18} />
                    </div>

                    <button
                      type="button"
                      className="btn btn-link p-0 text-start superadmin-kb-faq-q min-w-0"
                      onClick={() => setOpenId(open ? null : f.id)}
                      disabled={disableActions}
                    >
                      <span className="text-truncate d-inline-block">
                        {f.question}
                      </span>
                    </button>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <button
                      className="btn btn-link superadmin-kb-iconbtn"
                      onClick={() => setOpenId(open ? null : f.id)}
                      aria-label="Toggle"
                      disabled={disableActions}
                    >
                      <ChevronDown size={18} className={open ? "rot" : ""} />
                    </button>

                    <button
                      className="btn btn-link superadmin-kb-iconbtn"
                      onClick={() => onEdit(f.id)}
                      aria-label="Edit"
                      disabled={disableActions}
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      className="btn btn-link superadmin-kb-iconbtn danger"
                      onClick={() => setDeleteId(f.id)}
                      aria-label="Delete"
                      disabled={disableActions}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="text-muted mt-3 superadmin-kb-faq-a">
                    {f.answer}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div
          className="kb-modal-overlay"
          onClick={disableActions ? undefined : () => setDeleteId(null)}
        >
          <div
            className="kb-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 520 }}
          >
            <div className="kb-modal-header">
              <h5>Delete FAQ?</h5>
              <button
                className="kb-close-btn"
                onClick={() => setDeleteId(null)}
                disabled={disableActions as any}
              >
                ✕
              </button>
            </div>

            {/* ✅ AuthAlert inside modal (shows before close) */}
            <AuthAlert
              message={alertMessage}
              type={alertType}
              visible={visible}
              loading={loading}
            />

            <div className="kb-modal-body">
              <p className="mb-2">
                This action cannot be undone. Are you sure you want to delete
                this FAQ?
              </p>

              {selectedFaq && (
                <div className="p-3 rounded bg-light border">
                  <div className="fw-semibold text-truncate">
                    {selectedFaq.question}
                  </div>
                  <div className="text-muted small mt-1 text-truncate">
                    {selectedFaq.answer}
                  </div>
                </div>
              )}
            </div>

            <div className="kb-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteId(null)}
                disabled={disableActions}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={disableActions}
              >
                {loading ? "Deleting..." : isClosing ? "Closing..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
