import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  FaTicketAlt,
  FaListUl,
  FaComments,
  FaArrowRight,
  FaHistory,
  FaWarehouse,
  FaMoneyBillWave,
  FaUsers,
  FaArrowLeft,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";

const ROLES_GESTION_USUARIOS = ["SUPERADMIN"];
const ROLES_ADMIN = ["SUPERADMIN", "ADMIN"];

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

  const items = [
    { key: "tickets", icon: <FaTicketAlt />, label: "Tickets Soporte", path: esEquipoIT ? "/admin/dashboard" : "/crear", permitido: true },
    { key: "tareas", icon: <FaListUl />, label: "Asignación Tareas IT", path: "/admin/tareas", permitido: puedeGestionUsuarios },
    { key: "chat", icon: <FaComments />, label: "Chat por Área", path: "/admin/chat-area", permitido: true },
    { key: "entrada", icon: <FaArrowRight />, label: "Registro de Entrada", path: "/admin/registro-entrada", permitido: true },
    { key: "historial", icon: <FaHistory />, label: "Historial", path: "/admin/historial", permitido: true },
    { key: "almacen", icon: <FaWarehouse />, label: "Almacén", path: "/admin/almacen", permitido: esEquipoIT },
    { key: "pagos", icon: <FaMoneyBillWave />, label: "Pago de Proveedores", path: "/admin/pagos", permitido: esEquipoIT },
    { key: "usuarios", icon: <FaUsers />, label: "Usuarios", path: "/admin/usuarios", permitido: puedeGestionUsuarios },
    { key: "salida", icon: <FaArrowLeft />, label: "Registro de Salida", path: "/admin/registro-salida", permitido: true },
    { key: "reportes", icon: <FaChartBar />, label: "Reportes", path: "/admin/reportes", permitido: esEquipoIT },
    { key: "config", icon: <FaCog />, label: "Configuración", path: "/admin/configuracion", permitido: puedeGestionUsuarios },
  ];

  const handleClickItem = (item) => {
    if (!item.permitido) return;
    navigate(item.path);
  };

  return (
    <div className="rail">
      <div className="rail-menu" style={{ marginTop: "65px" }}>
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
                <strong>{item.label}</strong>
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
        {hoverItem === "logout" && (
          <div className="rail-tooltip">
            <strong>Cerrar sesión</strong>
          </div>
        )}
      </div>
    </div>
  );
}