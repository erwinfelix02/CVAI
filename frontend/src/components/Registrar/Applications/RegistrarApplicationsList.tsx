import type { ApplicationRow } from "./types";
import RegistrarApplicationRow from "./RegistrarApplicationRow";

type Props = {
  title: string;
  items: ApplicationRow[];
  onReview: (id: string) => void;
};

export default function RegistrarApplicationsList({ title, items, onReview }: Props) {
  return (
    <div className="card shadow-sm registrar-card">
     <div className="card-body p-3">
        <h5 className="fw-bold mb-2">{title}</h5>

        <div className="d-flex flex-column gap-3">
          {items.map((a) => (
            <RegistrarApplicationRow key={a.id} item={a} onReview={onReview} />
          ))}

          {items.length === 0 && (
            <div className="text-muted text-center py-4">No applications found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
