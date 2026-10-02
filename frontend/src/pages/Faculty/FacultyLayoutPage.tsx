import { Outlet } from "react-router-dom";
import FacultyLayout from "../../components/Faculty/FacultyLayout";

export default function FacultyLayoutPage() {
  return (
    <FacultyLayout>
      <Outlet />
    </FacultyLayout>
  );
}
