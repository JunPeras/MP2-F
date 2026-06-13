import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  children: React.ReactNode;
}

export default function ProfileRoute({ children }: Props) {
  const { user, profileComplete, initialized } = useAuthStore();

  if (!initialized) {
    return <LoadingSpinner text="Cargando..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
