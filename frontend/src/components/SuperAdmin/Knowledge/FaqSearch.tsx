// src/components/SuperAdmin/Knowledge/FaqSearch.tsx
import { Search } from "lucide-react";

type Props = {
  query: string;
  setQuery: (v: string) => void;
};

export default function FaqSearch({ query, setQuery }: Props) {
  return (
    <div className="superadmin-kb-search">
      <span className="superadmin-kb-search-ic">
        <Search size={16} />
      </span>
      <input
        className="form-control superadmin-kb-search-input"
        placeholder="Search FAQs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
