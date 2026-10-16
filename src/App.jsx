import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PosPage from "./pages/pos/PosPage";
import SalesHistoryPage from "./pages/pos/SalesHistoryPage";
import LoginForm from "./components/Login/LoginForm";
import Page1 from "./components/home/Page1";
import Page2 from "./components/home/Page2";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginForm />} />

          {/* Protected POS Terminal Routes */}
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <PosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pos/sales"
            element={
              <ProtectedRoute>
                <SalesHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Existing Home and Demo Pages */}
          <Route path="/" element={<Page1 />} />
          <Route path="/page2" element={<Page2 />} />

          {/* Fallback to POS */}
          <Route path="*" element={<Navigate to="/pos" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
