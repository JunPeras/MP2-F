import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, profileComplete, initialized } = useAuthStore();

  if (!initialized) {
    return <LoadingSpinner text="Cargando..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profileComplete) {
    const isGoogleUser = user.providerData.some((p) => p.providerId === "google.com");
    return <Navigate to={isGoogleUser ? "/registro-google" : "/login"} replace />;
  }

  return <>{children}</>;
}
