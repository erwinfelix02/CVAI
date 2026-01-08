import UserRow from "../../components/ChatPage/UserRow";
import type{ User } from "../../components/ChatPage/types";
interface UserTableProps {
  users: User[];
}

export default function UserTable({ users }: UserTableProps) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow key={u.id} user={u} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}