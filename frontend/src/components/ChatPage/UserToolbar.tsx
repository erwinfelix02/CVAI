import { Search } from "lucide-react";

export default function UserToolbar() {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-2">
      <div className="input-group w-100 w-md-50">
        <span className="input-group-text bg-white border-end-0">
          <Search size={16} />
        </span>
        <input
          type="text"
          className="form-control border-start-0"
          placeholder="Search by name, email, or ID..."
        />
      </div>

      <div className="btn-group" role="group">
        <button className="btn btn-outline-primary active">All</button>
        <button className="btn btn-outline-primary">Students</button>
        <button className="btn btn-outline-primary">Faculty</button>
      </div>
    </div>
  );
}
