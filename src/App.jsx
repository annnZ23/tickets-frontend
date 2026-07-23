import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import RegisterTicket from "./pages/RegisterTicket";
import MisConversaciones from "./pages/MisConversaciones";
import AdminDashboard from "./pages/AdminDashboard";
import AsignacionTareas from "./pages/AsignacionTareas";
import ChatPorArea from "./pages/ChatPorArea";
import Reportes from "./pages/Reportes";
import Usuarios from "./pages/Usuarios";
import Configuracion from "./pages/Configuracion";
import EncuestaSatisfaccion from "./pages/EncuestaSatisfaccion";
import RegistroEntrada from "./pages/RegistroEntrada";
import EquipoNuevo from "./pages/EquipoNuevo";
import EquipoReasignado from "./pages/EquipoReasignado";
import Historial from "./pages/Historial";
import AlmacenBodega from "./pages/AlmacenBodega";
import PagoProveedores from "./pages/Pagoproveedores";
import RegistroSalida from "./pages/RegistroSalida";
import HistorialMovimientos from "./pages/HistorialMovimientos";

const ROLES_ADMIN = ["SUPERADMIN", "ADMIN"];
const ROLES_GESTION_USUARIOS = ["SUPERADMIN"];

function RutaProtegida({ usuario, rolesPermitidos, children }) {
  if (!usuario) {
    return <Navigate to="/" replace />;
  }
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.role)) {
    const destino = ROLES_ADMIN.includes(usuario.role) ? "/admin/dashboard" : "/crear";
    return <Navigate to={destino} replace />;
  }
  return children;
}

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

 useEffect(() => {
  const usuarioGuardado = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (usuarioGuardado && token) {
    try {
      setUsuario(JSON.parse(usuarioGuardado));
    } catch (err) {
      console.error("Sesión guardada corrupta, se limpia:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }
  setCargandoSesion(false);
}, []);

  const cerrarSesion = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUsuario(null);
  };

  if (cargandoSesion) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login setUsuario={setUsuario} />} />

        <Route
          path="/crear"
          element={
            <RutaProtegida usuario={usuario}>
              <RegisterTicket usuario={usuario} cerrarSesion={cerrarSesion} />
            </RutaProtegida>
          }
        />

        <Route
          path="/chat"
          element={
            <RutaProtegida usuario={usuario}>
              <MisConversaciones usuario={usuario} cerrarSesion={cerrarSesion} />
            </RutaProtegida>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <RutaProtegida usuario={usuario}>
              <MisConversaciones usuario={usuario} cerrarSesion={cerrarSesion} />
            </RutaProtegida>
          }
        />

        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        <Route
          path="/admin/dashboard"
          element={
            <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_ADMIN}>
              <AdminDashboard usuario={usuario} cerrarSesion={cerrarSesion} />
            </RutaProtegida>
          }
        />

        <Route
          path="/admin/usuarios"
          element={
            <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_GESTION_USUARIOS}>
              <Usuarios usuario={usuario} cerrarSesion={cerrarSesion} />
            </RutaProtegida>
          }
        />

        <Route
          path="/admin/reportes"
          element={
            <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_ADMIN}>
              <Reportes usuario={usuario} cerrarSesion={cerrarSesion} />
            </RutaProtegida>
          }
        />

        <Route
          path="/admin/tareas"
          element={
            <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_ADMIN}>
              <AsignacionTareas usuario={usuario} cerrarSesion={cerrarSesion} />
            </RutaProtegida>
          }
        />

        <Route
          path="/admin/chat-area"
          element={
            <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_ADMIN}>
              <ChatPorArea usuario={usuario} />
            </RutaProtegida>
          }
        />
        <Route
  path="/admin/registro-entrada"
  element={
    <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_ADMIN}>
      <RegistroEntrada usuario={usuario} cerrarSesion={cerrarSesion} />
    </RutaProtegida>
  }
/>
        <Route
          path="/admin/configuracion"
          element={
            <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_GESTION_USUARIOS}>
              <Configuracion usuario={usuario} cerrarSesion={cerrarSesion} />
            </RutaProtegida>
          }
        />

<Route path="/admin/equipo-nuevo" element={
  <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_ADMIN}>
    <EquipoNuevo usuario={usuario} cerrarSesion={cerrarSesion} />
  </RutaProtegida>
} />

<Route path="/admin/equipo-reasignado" element={
  <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_ADMIN}>
    <EquipoReasignado usuario={usuario} cerrarSesion={cerrarSesion} />
  </RutaProtegida>
} />

<Route path="/admin/historial" element={
  <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_ADMIN}>
    <Historial usuario={usuario} cerrarSesion={cerrarSesion} />
  </RutaProtegida>
} />

<Route path="/admin/almacen" element={
  <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_ADMIN}>
    <AlmacenBodega usuario={usuario} cerrarSesion={cerrarSesion} />
  </RutaProtegida>
} />

<Route path="/admin/pagos" element={
  <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_ADMIN}>
    <PagoProveedores usuario={usuario} cerrarSesion={cerrarSesion} />
  </RutaProtegida>
} />

<Route path="/admin/registro-salida" element={
  <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_ADMIN}>
    <RegistroSalida usuario={usuario} cerrarSesion={cerrarSesion} />
  </RutaProtegida>
} />

<Route path="/admin/movimientos" element={
  <RutaProtegida usuario={usuario} rolesPermitidos={ROLES_ADMIN}>
    <HistorialMovimientos usuario={usuario} cerrarSesion={cerrarSesion} />
  </RutaProtegida>
} />

        <Route path="/encuesta/:id" element={<EncuestaSatisfaccion />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
