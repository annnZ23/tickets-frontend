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

 
  const isAdmin = user?.role === "ADMIN" || user?.role === "ADMIN_SOPORTE";

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

        
        <div 
          className={`menu-item ${isActive("/admin") || isActive("/crear") ? "active" : ""}`}
          onClick={() => navigate(user?.role === "ADMIN" ? "/admin" : "/crear")}
        >
          <FaTicketAlt />
          <span>Tickets Soporte</span>
        </div>

       
        {isAdmin && (
          <div 
            className={`menu-item ${isActive("/admin/tareas") ? "active" : ""}`}
            onClick={() => navigate("/admin/tareas")}
          >
            <FaListUl />
            <span>Asignación Tareas IT</span>
          </div>
        )}

       
        <div 
          className={`menu-item ${isActive("/chat-area") ? "active" : ""}`}
          onClick={() => navigate("/chat-area")}
        >
          <FaComments />
          <span>Chat por Área</span>
        </div>

       
        {isAdmin && (
          <div 
            className={`menu-item ${isActive("/admin/usuarios") ? "active" : ""}`}
            onClick={() => navigate("/admin/usuarios")}
          >
            <FaUsers />
            <span>Usuarios</span>
          </div>
        )}

       
        {isAdmin && (
          <div 
            className={`menu-item ${isActive("/admin/reportes") ? "active" : ""}`}
            onClick={() => navigate("/admin/reportes")}
          >
            <FaChartBar />
            <span>Reportes</span>
          </div>
        )}

        
        <div 
          className={`menu-item ${isActive("/configuracion") ? "active" : ""}`}
          onClick={() => navigate("/configuracion")}
        >
          <FaCog />
          <span>Configuración</span>
        </div>

      </div>

      
      <div className="sidebar-footer">
        <div className="menu-item logout" onClick={logout}>
          <FaSignOutAlt />
          <span>Cerrar sesión</span>
        </div>
      </div>

    </div>
  );
}