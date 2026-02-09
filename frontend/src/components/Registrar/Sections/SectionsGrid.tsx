import type { SectionItem } from "./types";
import SectionCard from "./SectionCard";

export default function SectionsGrid({ items }: { items: SectionItem[] }) {
  return (
    <div className="row g-3 g-md-4">
      {items.map((s) => (
        <div key={s.id} className="col-12 col-md-6 col-xl-4">
          <SectionCard item={s} />
        </div>
      ))}

      {items.length === 0 && (
        <div className="col-12">
          <div className="text-muted py-4">No matching sections.</div>
        </div>
      )}
    </div>
  );
}
