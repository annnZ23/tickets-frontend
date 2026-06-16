import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importaciones de tus páginas existentes
import Login from "./pages/Login";
import RegisterTicket from "./pages/RegisterTicket";
import ChatTicket from "./pages/ChatTicket";
import AdminDashboard from "./pages/AdminDashboard";
import AsignacionTareas from "./pages/AsignacionTareas";
import ChatPorArea from "./pages/ChatPorArea";
import Reportes from "./pages/Reportes";

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
       
        <Route path="/" element={<Login />} />

       
        <Route
          path="/crear"
          element={
            <ProtectedRoute allowedRole="USER">
              <RegisterTicket />
            </ProtectedRoute>
          }
        />
<Route path="/admin/reportes" element={<Reportes />} />
       
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

       
        <Route
          path="/admin/tareas"
          element={
            <ProtectedRoute>
              <AsignacionTareas />
            </ProtectedRoute>
          }
        />

       
        <Route path="/chat" element={<ChatPorArea />} />
<Route path="/chat/:idTicket" element={<ChatPorArea />} />
        
        
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <ChatTicket />
            </ProtectedRoute>
          }
        />

       
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;