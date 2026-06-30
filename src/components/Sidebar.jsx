import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTicketAlt,
  FaListUl,
  FaComments,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import baprosaLogo from "../assets/baprosa-logo.png";
import "./Sidebar.css";

const ROLES_GESTION_USUARIOS = ["SUPERADMIN"];
const ROLES_ADMIN = ["SUPERADMIN", "ADMIN"];

const getIniciales = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
};

export default function Sidebar({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoverItem, setHoverItem] = useState(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (cerrarSesion) {
      cerrarSesion();
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    navigate("/");
  };

  const puedeGestionUsuarios = ROLES_GESTION_USUARIOS.includes(usuario?.role);
  const esEquipoIT = ROLES_ADMIN.includes(usuario?.role);

  // Definición única de todos los ítems del rail.
  // - path: a dónde navega
  // - permitido: si el usuario actual puede usarlo
  // - Para USER (empleado): solo "Mis Tickets" y "Chat por Área" quedan habilitados.
  //   El resto se muestra bloqueado (visible pero no clicable).
  const items = [
    {
      key: "tickets",
      icon: <FaTicketAlt />,
      label: esEquipoIT ? "Tickets Soporte" : "Mis Tickets",
      path: esEquipoIT ? "/admin/dashboard" : "/crear",
      permitido: true, // todos pueden crear/ver tickets, IT o empleado
    },
    {
      key: "tareas",
      icon: <FaListUl />,
      label: "Asignación Tareas IT",
      path: "/admin/tareas",
      permitido: puedeGestionUsuarios,
    },
    {
      key: "chat",
      icon: <FaComments />,
      label: "Chat por Área",
      path: "/admin/chat-area",
      permitido: true, // empleados y asesores usan el chat para dar seguimiento al ticket
    },
    {
      key: "usuarios",
      icon: <FaUsers />,
      label: "Usuarios",
      path: "/admin/usuarios",
      permitido: puedeGestionUsuarios,
    },
    {
      key: "reportes",
      icon: <FaChartBar />,
      label: "Reportes",
      path: "/admin/reportes",
      permitido: esEquipoIT,
    },
    {
      key: "config",
      icon: <FaCog />,
      label: "Configuración",
      path: "/admin/configuracion",
      permitido: puedeGestionUsuarios,
    },
  ];

  const handleClickItem = (item) => {
    if (!item.permitido) return;
    navigate(item.path);
  };

  return (
    <div className="rail">
      <div className="rail-menu" style={{ marginTop: "8px" }}>
        {items.map((item) => (
          <div
            key={item.key}
            className={`rail-item ${isActive(item.path) ? "active" : ""} ${!item.permitido ? "blocked" : ""}`}
            onClick={() => handleClickItem(item)}
            onMouseEnter={() => setHoverItem(item.key)}
            onMouseLeave={() => setHoverItem(null)}
          >
            {item.icon}
            {hoverItem === item.key && (
              <div className="rail-tooltip">
                {item.permitido ? item.label : "No tienes acceso"}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="rail-item logout"
        onClick={handleLogout}
        onMouseEnter={() => setHoverItem("logout")}
        onMouseLeave={() => setHoverItem(null)}
      >
        <FaSignOutAlt />
        {hoverItem === "logout" && <div className="rail-tooltip">Cerrar sesión</div>}
      </div>
    </div>
  );
}