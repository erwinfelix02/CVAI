import type { ReactNode } from "react";
import useIdleLogout from "../customHooks/useIdleLogout";

interface Props {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: Props) {
  useIdleLogout();
  return <>{children}</>;
}
