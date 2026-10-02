import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function RequireAuth({ children, allowedRoles = [] }: Props) {
  const location = useLocation();

  const token = localStorage.getItem("sessionToken");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Logged in but wrong role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}