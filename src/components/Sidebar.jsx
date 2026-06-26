import { useNavigate, useLocation } from "react-router-dom";
import { FaTicketAlt, FaListUl, FaComments, FaUsers, FaChartBar, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

const ROLES_GESTION_USUARIOS = ["SUPERADMIN"];
const ROLES_ADMIN = ["SUPERADMIN", "ADMIN"];

export default function Sidebar({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="sidebar">
      <div className="logo-box">
        <span className="logo-img">BAPROSA IT</span>
      </div>

      <div className="user-area">
        <div style={{ fontWeight: 700, color: "#1e293b" }}>{usuario?.name || "Usuario"}</div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{usuario?.role}</div>
      </div>

      <p className="nav-title">Navegación</p>

      <div className="menu">
        {esEquipoIT && (
          <div
            className={`menu-item ${isActive("/admin/dashboard") ? "active" : ""}`}
            onClick={() => navigate("/admin/dashboard")}
          >
            <FaTicketAlt />
            <span>Tickets Soporte</span>
          </div>
        )}

        {!esEquipoIT && (
          <div
            className={`menu-item ${isActive("/crear") ? "active" : ""}`}
            onClick={() => navigate("/crear")}
          >
            <FaTicketAlt />
            <span>Mis Tickets</span>
          </div>
        )}

        {puedeGestionUsuarios && (
          <div
            className={`menu-item ${isActive("/admin/tareas") ? "active" : ""}`}
            onClick={() => navigate("/admin/tareas")}
          >
            <FaListUl />
            <span>Asignación Tareas IT</span>
          </div>
        )}

        {esEquipoIT && (
          <div
            className={`menu-item ${isActive("/admin/chat-area") ? "active" : ""}`}
            onClick={() => navigate("/admin/chat-area")}
          >
            <FaComments />
            <span>Chat por Área</span>
          </div>
        )}

        {puedeGestionUsuarios && (
          <div
            className={`menu-item ${isActive("/admin/usuarios") ? "active" : ""}`}
            onClick={() => navigate("/admin/usuarios")}
          >
            <FaUsers />
            <span>Usuarios</span>
          </div>
        )}

        {esEquipoIT && (
          <div
            className={`menu-item ${isActive("/admin/reportes") ? "active" : ""}`}
            onClick={() => navigate("/admin/reportes")}
          >
            <FaChartBar />
            <span>Reportes</span>
          </div>
        )}

        {puedeGestionUsuarios && (
          <div
            className={`menu-item ${isActive("/admin/configuracion") ? "active" : ""}`}
            onClick={() => navigate("/admin/configuracion")}
          >
            <FaCog />
            <span>Configuración</span>
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="menu-item logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Cerrar Sesión</span>
        </div>
      </div>
    </div>
  );
}