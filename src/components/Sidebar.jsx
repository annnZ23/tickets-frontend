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
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const ROLES_GESTION_USUARIOS = ["SUPERADMIN"];
const ROLES_ADMIN = ["SUPERADMIN", "ADMIN"];

export default function Sidebar({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoverItem, setHoverItem] = useState(null);
  const [colapsado, setColapsado] = useState(() => {
    return localStorage.getItem("sidebarColapsado") === "true";
  });

  const toggleColapsado = () => {
    setColapsado((prev) => {
      const nuevo = !prev;
      localStorage.setItem("sidebarColapsado", String(nuevo));
      return nuevo;
    });
  };

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
    { key: "tareas", icon: <FaListUl />, label: "Asignación Tareas IT", path: "/admin/tareas", permitido: esEquipoIT },
   
    ...(!esEquipoIT
      ? [{ key: "chat", icon: <FaComments />, label: "Mis Conversaciones", path: "/chat", permitido: true }]
      : []),
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
    <div
      className={`h-screen sticky top-0 flex flex-col bg-white border-r border-gray-100 flex-shrink-0 font-['Inter',sans-serif] transition-all duration-200 ease-in-out ${
        colapsado ? "w-[72px]" : "w-[240px]"
      }`}
    >
      <div className={`flex items-center pt-5 pb-2 ${colapsado ? "justify-center px-0" : "justify-between px-5"}`}>
        {!colapsado && (
          <span className="text-[10.5px] font-bold tracking-wide text-gray-400 uppercase">Navegación</span>
        )}
        <button
          onClick={toggleColapsado}
          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-[#f58220] transition-colors"
          title={colapsado ? "Expandir menú" : "Colapsar menú"}
        >
          {colapsado ? <FaChevronRight className="text-xs" /> : <FaChevronLeft className="text-xs" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-[3px] px-3">
        {items.map((item) => (
          <div
            key={item.key}
            onClick={() => handleClickItem(item)}
            onMouseEnter={() => setHoverItem(item.key)}
            onMouseLeave={() => setHoverItem(null)}
            className={`relative flex items-center h-[42px] rounded-[10px] text-[13.5px] font-semibold transition-colors
              ${colapsado ? "justify-center px-0" : "gap-3 px-3"}
              ${isActive(item.path)
                ? "bg-[#f58220] text-white"
                : item.permitido
                ? "text-slate-600 hover:bg-orange-50 hover:text-[#f58220] cursor-pointer"
                : "text-gray-300 cursor-not-allowed hover:bg-gray-50"
              }`}
          >
            <span className="w-5 flex items-center justify-center text-base flex-shrink-0">
              {item.icon}
            </span>
            {!colapsado && <span className="truncate">{item.label}</span>}
            {hoverItem === item.key && (colapsado || !item.permitido) && (
              <div className={`absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg z-50 pointer-events-none ${item.permitido ? "bg-[#e66a10]" : "bg-slate-500"}`}>
                {item.permitido ? item.label : "Acceso bloqueado"}
                <div className={`absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent ${item.permitido ? "border-r-[#e66a10]" : "border-r-slate-500"}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        onClick={handleLogout}
        onMouseEnter={() => setHoverItem("logout")}
        onMouseLeave={() => setHoverItem(null)}
        className={`relative flex items-center h-[42px] mx-3 mb-3 rounded-[10px] text-[13.5px] font-semibold text-red-500 hover:bg-red-50 cursor-pointer ${
          colapsado ? "justify-center px-0" : "gap-3 px-3"
        }`}
      >
        <span className="w-5 flex items-center justify-center text-base flex-shrink-0">
          <FaSignOutAlt />
        </span>
        {!colapsado && <span>Cerrar sesión</span>}

        {hoverItem === "logout" && colapsado && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg z-50 pointer-events-none">
            Cerrar sesión
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-red-500" />
          </div>
        )}
      </div>
    </div>
  );
}