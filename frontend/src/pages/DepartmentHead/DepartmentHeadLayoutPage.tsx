// src/pages/DepartmentHead/DepartmentHeadLayoutPage.tsx
import { Outlet } from "react-router-dom";
import DepartmentHeadLayout from "../../components/DepartmentHead/DepartmentHeadLayout";

export default function DepartmentHeadLayoutPage() {
  return (
    <DepartmentHeadLayout>
      <Outlet />
    </DepartmentHeadLayout>
  );
}
