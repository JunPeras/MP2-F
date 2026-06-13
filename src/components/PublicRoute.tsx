import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: Props) {
  const { user, profileComplete, initialized } = useAuthStore();

  if (!initialized) {
    return <LoadingSpinner text="Cargando..." />;
  }

  if (!user) {
    return <>{children}</>;
  }

  if (profileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  const isGoogleUser = user.providerData.some((p) => p.providerId === "google.com");
  if (isGoogleUser) {
    return <Navigate to="/registro-google" replace />;
  }

  return <>{children}</>;
}
