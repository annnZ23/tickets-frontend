import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import baprosaLogo from "../assets/baprosa-logo.png";

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

const ROLES_GESTION_USUARIOS = ["SUPERADMIN"];
const ROLES_ADMIN = ["SUPERADMIN", "ADMIN"];

export default function Sidebar({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoverBloqueado, setHoverBloqueado] = useState(null);

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
    { key: "entrada", icon: <FaArrowRight />, label: "Registro de Entrada", path: "/admin/registro-entrada", permitido: esEquipoIT },
    { key: "historial", icon: <FaHistory />, label: "Historial", path: "/admin/historial", permitido: esEquipoIT },
    { key: "almacen", icon: <FaWarehouse />, label: "Almacén", path: "/admin/almacen", permitido: esEquipoIT },
    { key: "pagos", icon: <FaMoneyBillWave />, label: "Pago de Proveedores", path: "/admin/pagos", permitido: esEquipoIT },
    { key: "usuarios", icon: <FaUsers />, label: "Usuarios", path: "/admin/usuarios", permitido: puedeGestionUsuarios },
    { key: "salida", icon: <FaArrowLeft />, label: "Registro de Salida", path: "/admin/registro-salida", permitido: esEquipoIT },
    { key: "reportes", icon: <FaChartBar />, label: "Reportes", path: "/admin/reportes", permitido: esEquipoIT },
    { key: "config", icon: <FaCog />, label: "Configuración", path: "/admin/configuracion", permitido: puedeGestionUsuarios },
  ];

  const handleClickItem = (item) => {
    if (!item.permitido) return;
    navigate(item.path);
  };

  return (
    <div className="w-[240px] h-screen sticky top-0 flex flex-col bg-white border-r border-gray-100 flex-shrink-0 font-['Inter',sans-serif]">
      {/* Logo */}
      <div className="flex items-center px-5 pt-4 pb-5">
        <img src={baprosaLogo} alt="Baprosa" className="h-9 w-auto object-contain" />
      </div>

      <div className="px-5 pb-2 text-[10.5px] font-bold tracking-wide text-gray-400 uppercase">
        Navegación
      </div>

      {/* Menú */}
      <div className="flex-1 flex flex-col gap-[3px] px-3">
        {items.map((item) => (
          <div
            key={item.key}
            onClick={() => handleClickItem(item)}
            onMouseEnter={() => !item.permitido && setHoverBloqueado(item.key)}
            onMouseLeave={() => setHoverBloqueado(null)}
            className={`relative flex items-center gap-3 h-[42px] px-3 rounded-[10px] text-[13.5px] font-semibold transition-colors
              ${isActive(item.path)
                ? "bg-[#f58220] text-white"
                : item.permitido
                ? "text-slate-600 hover:bg-orange-50 hover:text-[#f58220] cursor-pointer"
                : "text-gray-300 cursor-not-allowed hover:bg-gray-50"
              }`}
          >
            <span className="w-5 flex items-center justify-center text-base">
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>

            {hoverBloqueado === item.key && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg z-50 pointer-events-none">
                Acceso bloqueado
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-800" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cerrar sesión, anclado abajo */}
      <div
        onClick={handleLogout}
        className="flex items-center gap-3 h-[42px] mx-3 mb-3 px-3 rounded-[10px] text-[13.5px] font-semibold text-red-500 hover:bg-red-50 cursor-pointer"
      >
        <span className="w-5 flex items-center justify-center text-base">
          <FaSignOutAlt />
        </span>
        <span>Cerrar sesión</span>
      </div>
    </div>
  );
}