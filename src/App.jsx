import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importaciones de tus páginas existentes
import Login from "./pages/Login";
import RegisterTicket from "./pages/RegisterTicket";
import ChatTicket from "./pages/ChatTicket";
import AdminDashboard from "./pages/AdminDashboard";
import AsignacionTareas from "./pages/AsignacionTareas";
import ChatPorArea from "./pages/ChatPorArea";

const ProtectedRoute = ({ allowedRole, children }) => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user) {
    return <Login />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/crear"} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública */}
        <Route path="/" element={<Login />} />

        {/* Ruta exclusiva para Asesores/Usuarios Regulares */}
        <Route
          path="/crear"
          element={
            <ProtectedRoute allowedRole="USER">
              <RegisterTicket />
            </ProtectedRoute>
          }
        />

        {/* Panel de administración */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 🛠️ Asignación de tareas de IT (Corregido: Permite entrada a ADMIN y USER para evitar rupturas síncronas) */}
        <Route
          path="/admin/tareas"
          element={
            <ProtectedRoute>
              <AsignacionTareas />
            </ProtectedRoute>
          }
        />

        {/* 🔒 Chat por Área Protegido */}
        <Route 
          path="/admin/chat" 
          element={
            <ProtectedRoute>
              <ChatPorArea />
            </ProtectedRoute>
          } 
        /> 
        
        {/* Chat individual de un ticket específico */}
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <ChatTicket />
            </ProtectedRoute>
          }
        />

        {/* Redirección por defecto si la ruta no existe */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;