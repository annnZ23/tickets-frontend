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
  
  const isAdmin = user?.role === "ADMIN" || user?.role === "ADMIN_SOPORTE";
  const isActive = (path) => location.pathname === path;

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="sidebar">
      <div className="logo-box" style={{ marginTop: "5px", marginBottom: "15px" }}>
        <img src={logo} className="logo-img" alt="Logo corporativo Baprosa" />
      </div>

      <p className="nav-title">Navegación</p>

      <div className="menu">
        <div 
          className={`menu-item ${isActive("/admin/dashboard") || isActive("/crear") ? "active" : ""}`}
          onClick={() => navigate(user?.role === "ADMIN" ? "/admin/dashboard" : "/crear")}
        >
          <FaTicketAlt /> <span>Tickets Soporte</span>
        </div>

        {isAdmin && (
          <div 
            className={`menu-item ${isActive("/admin/tareas") ? "active" : ""}`}
            onClick={() => navigate("/admin/tareas")}
          >
            <FaListUl /> <span>Asignación Tareas IT</span>
          </div>
        )}

        <div 
          className={`menu-item ${isActive("/admin/chat-area") ? "active" : ""}`}
          onClick={() => navigate("/admin/chat-area")}
        >
          <FaComments /> <span>Chat por Área</span>
        </div>

        {isAdmin && (
          <div 
            className={`menu-item ${isActive("/admin/usuarios") ? "active" : ""}`}
            onClick={() => navigate("/admin/usuarios")}
          >
            <FaUsers /> <span>Usuarios</span>
          </div>
        )}

        {isAdmin && (
          <div 
            className={`menu-item ${isActive("/admin/reportes") ? "active" : ""}`}
            onClick={() => navigate("/admin/reportes")}
          >
            <FaChartBar /> <span>Reportes</span>
          </div>
        )}

        <div 
          className={`menu-item ${isActive("/admin/configuracion") ? "active" : ""}`}
          onClick={() => navigate("/admin/configuracion")}
        >
          <FaCog /> <span>Configuración</span>
        </div>
      </div>

      {/* REINTEGRACIÓN DEL BOTÓN DE CIERRE DE SESIÓN */}
      <div className="sidebar-footer">
        <div className="menu-item logout" onClick={logout} style={{ marginTop: "20px", color: "#e74c3c" }}>
          <FaSignOutAlt />
          <span>Cerrar sesión</span>
        </div>
      </div>
    </div>
  );
}