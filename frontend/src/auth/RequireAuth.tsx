import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function RequireAuth({ children }: Props) {
  const token = localStorage.getItem("sessionToken");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
