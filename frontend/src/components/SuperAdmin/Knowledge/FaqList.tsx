// src/components/SuperAdmin/Knowledge/FaqList.tsx
import { useState } from "react";
import { ChevronDown, Pencil, Trash2, HelpCircle } from "lucide-react";
import type { FaqItem } from "./types";

type Props = {
  items: FaqItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function FaqList({ items, onEdit, onDelete }: Props) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  if (items.length === 0) {
    return <div className="text-muted text-center py-5">No FAQs found.</div>;
  }

  return (
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
                  >
                    <span className="text-truncate d-inline-block">{f.question}</span>
                  </button>
                </div>

                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <button
                    className="btn btn-link superadmin-kb-iconbtn"
                    onClick={() => setOpenId(open ? null : f.id)}
                    aria-label="Toggle"
                  >
                    <ChevronDown size={18} className={open ? "rot" : ""} />
                  </button>

                  <button
                    className="btn btn-link superadmin-kb-iconbtn"
                    onClick={() => onEdit(f.id)}
                    aria-label="Edit"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    className="btn btn-link superadmin-kb-iconbtn danger"
                    onClick={() => onDelete(f.id)}
                    aria-label="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {open && <div className="text-muted mt-3 superadmin-kb-faq-a">{f.answer}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
