import { Outlet } from "react-router-dom";
import SuperAdminLayout from "../../components/SuperAdmin/SuperAdminLayout";

export default function SuperAdminLayoutPage() {
  return (
    <SuperAdminLayout>
      <Outlet />
    </SuperAdminLayout>
  );
}
