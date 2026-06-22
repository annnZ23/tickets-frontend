import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RegisterTicket from "./pages/RegisterTicket";
import ChatTicket from "./pages/ChatTicket";
import AdminDashboard from "./pages/AdminDashboard";
import AsignacionTareas from "./pages/AsignacionTareas";
import ChatPorArea from "./pages/ChatPorArea";
import Reportes from "./pages/Reportes";
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion'; // Asegúrate de importar esto

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/crear" element={<RegisterTicket />} />
        
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
        <Route path="/admin/reportes" element={<Reportes />} />
        <Route path="/admin/tareas" element={<AsignacionTareas />} />
        <Route path="/admin/chat-area" element={<ChatPorArea />} />
        <Route path="/admin/configuracion" element={<Configuracion />} />

        <Route path="/chat/:id" element={<ChatTicket />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;