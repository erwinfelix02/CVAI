import RoleCard from "./RoleCard";
import type { RoleCardItem } from "./types";

type Props = {
  items: RoleCardItem[];
  onOpen: (id: string) => void;
  onSettings: (id: string) => void;
};

export default function RoleGrid({ items, onOpen, onSettings }: Props) {
  return (
    <div className="row g-3 g-md-4">
      {items.map((r) => (
        <div key={r.id} className="col-12 col-lg-4">
          <RoleCard item={r} onOpen={onOpen} onSettings={onSettings} />
        </div>
      ))}
    </div>
  );
}
