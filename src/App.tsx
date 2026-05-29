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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
