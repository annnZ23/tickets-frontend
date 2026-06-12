import logo from "../assets/baprosa-logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTicketAlt,
  FaListUl,
  FaComments,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";
import "./sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const isActive = (path) => location.pathname === path;

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="sidebar">

      <div className="logo-box">
        <img src={logo} className="logo-img" alt="Logo" />
      </div>

      <div className="user-area">
        {user?.email}
      </div>

      <p className="nav-title">Navegación</p>

      <div className="menu">

        <div className={`menu-item ${isActive("/crear") ? "active" : ""}`}
          onClick={() => navigate("/crear")}>
          <FaTicketAlt />
          <span>Tickets Soporte</span>
        </div>

        <div className="menu-item">
          <FaListUl />
          <span>Asignación Tareas IT</span>
        </div>

        <div className="menu-item">
          <FaComments />
          <span>Chat por Área</span>
        </div>

        <div className="menu-item">
          <FaUsers />
          <span>Usuarios</span>
        </div>

        <div className="menu-item">
          <FaChartBar />
          <span>Reportes</span>
        </div>

        <div className="menu-item">
          <FaCog />
          <span>Configuración</span>
        </div>

      </div>

      {/* Logout siempre al fondo */}
      <div className="sidebar-footer">
        <div className="menu-item logout" onClick={logout}>
          <FaSignOutAlt />
          <span>Cerrar sesión</span>
        </div>
      </div>

    </div>
  );
}