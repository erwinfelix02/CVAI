import { Outlet } from "react-router-dom";
import StudentLayout from "../../components/Student/StudentLayout";

export default function StudentLayoutPage() {
  return (
    <StudentLayout>
      <Outlet /> {/* This acts as the children for StudentLayout */}
    </StudentLayout>
  );
}
