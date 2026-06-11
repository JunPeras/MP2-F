import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import LoginPage from "./pages/LoginPage";
import RegistroPage from "./pages/RegistroPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import DashboardPage from "./pages/DashboardPage";
import PublicRoute from "./components/PublicRoute";
import ProfileRoute from "./components/ProfileRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import SalaPage from "./pages/SalaPage";

function App() {
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/registro"
          element={
            <PublicRoute>
              <RegistroPage />
            </PublicRoute>
          }
        />
        <Route
          path="/registro-google"
          element={
            <ProfileRoute>
              <CompleteProfilePage />
            </ProfileRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sala/:id"
          element={
            <ProtectedRoute>
              <SalaPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
