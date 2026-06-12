import { useState } from "react";
import logo from "../assets/baprosa-logo.png";
import {
  FaSignInAlt, FaHistory, FaWarehouse, FaFileInvoiceDollar,
  FaSignOutAlt, FaChartBar, FaCog, FaQuestionCircle,
  FaDesktop, FaArrowLeft, FaBell, FaSearch, FaUserCircle,
  FaExclamationTriangle, FaClock, FaChevronDown
} from "react-icons/fa";
import "./Inventario.css";

const menuItems = [
  { icon: <FaSignInAlt />, label: "Registro de Entrada", key: "entrada" },
  { icon: <FaHistory />, label: "Historial", key: "historial" },
  { icon: <FaWarehouse />, label: "Almacén", key: "almacen" },
  { icon: <FaFileInvoiceDollar />, label: "Pago de Proveedores", key: "pagos" },
  { icon: <FaSignOutAlt />, label: "Registro de Salida", key: "salida" },
  { icon: <FaChartBar />, label: "Reportes", key: "reportes" },
  { icon: <FaCog />, label: "Configuración", key: "config" },
];

export default function InventarioDashboard() {
  const [active, setActive] = useState("entrada");

  return (
    <div className="inv-layout">

      {/* SIDEBAR */}
      <aside className="inv-sidebar">
        <div className="inv-logo-box">
          <img src={logo} alt="Baprosa" className="inv-logo" />
        </div>

        <nav className="inv-menu">
          {menuItems.map((item) => (
            <div
              key={item.key}
              className={`inv-menu-item ${active === item.key ? "active" : ""}`}
              onClick={() => setActive(item.key)}
            >
              <span className="inv-menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* ALERTAS ESTÁTICAS */}
        <div className="inv-alerts">
          <div className="inv-alert warning">
            <FaExclamationTriangle className="inv-alert-icon" />
            <div>
              <strong>Stock bajo</strong>
              <p>3 categorías de equipos tienen inventario por debajo del mínimo.</p>
            </div>
          </div>

          <div className="inv-alert info">
            <FaClock className="inv-alert-icon" />
            <div>
              <strong>Pago pendiente</strong>
              <p>Factura #4621 de TechSupply vence en 2 días.</p>
            </div>
          </div>
        </div>

        <div className="inv-menu-item inv-help">
          <span className="inv-menu-icon"><FaQuestionCircle /></span>
          <span>Ayuda</span>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="inv-main">

        {/* TOPBAR */}
        <div className="inv-topbar">
          <div className="inv-topbar-left">
            <button className="inv-icon-btn"><FaSearch /></button>
            <span className="inv-topbar-badge">3</span>
            <button className="inv-icon-btn"><FaBell /></button>
            <button className="inv-icon-btn"><FaUserCircle /></button>
            <button className="inv-icon-btn"><FaCog /></button>
          </div>
          <div className="inv-topbar-right">
            <div className="inv-user-chip">
              <div className="inv-avatar">MF</div>
              <div className="inv-user-info">
                <strong>Manuel Flores</strong>
                <small>Soporte Técnico</small>
              </div>
              <FaChevronDown className="inv-chevron" />
            </div>
          </div>
        </div>

        {/* PÁGINA: REGISTRO DE ENTRADA */}
        {active === "entrada" && (
          <div className="inv-page">
            <div className="inv-page-header">
              <h1>Registro de Entrada</h1>
              <p>Antes de registrar un equipo, selecciona el tipo de entrada que deseas realizar. Esto nos permitirá guiarte por el flujo correcto.</p>
            </div>

            <div className="inv-hint">
              <span className="inv-hint-icon">💡</span>
              ¿El equipo que vas a registrar es nuevo o viene reasignado de otro usuario?
            </div>

            <div className="inv-cards">

              <div className="inv-option-card">
                <div className="inv-option-icon">
                  <FaDesktop />
                </div>
                <h3>Equipo Nuevo</h3>
                <p>Registra un equipo que ingresa por primera vez al inventario. Podrás crear un nuevo registro completo incluyendo categoría, ubicación, accesorios asociados y generar la hoja de entrega correspondiente.</p>
                <ul className="inv-option-list">
                  <li>✔ Crear registro con categoría y ubicación</li>
                  <li>✔ Agregar accesorios del equipo</li>
                  <li>✔ Generar hoja de entrega</li>
                  <li>✔ Asignar usuario responsable</li>
                </ul>
                <button className="inv-btn-primary">Seleccionar Equipo Nuevo</button>
              </div>

              <div className="inv-option-card outlined">
                <div className="inv-option-icon outlined">
                  <FaArrowLeft />
                </div>
                <h3>Equipo Reasignado</h3>
                <p>Registra un equipo que ya existe en el inventario y será reasignado a un nuevo usuario. Podrás revisar el historial de asignaciones, verificar el estado actual y actualizar la información.</p>
                <ul className="inv-option-list">
                  <li>✔ Revisar historial de asignaciones</li>
                  <li>✔ Verificar estado actual del equipo</li>
                  <li>✔ Agregar accesorios y nuevo usuario</li>
                  <li>✔ Imprimir hoja de entrega actualizada</li>
                </ul>
                <button className="inv-btn-outline">Seleccionar Equipo Reasignado</button>
              </div>

            </div>

            <p className="inv-footer-note">
              ⓘ Si no estás seguro del tipo de entrada, consulta con el área de soporte técnico antes de continuar.
            </p>
          </div>
        )}

        {active !== "entrada" && (
          <div className="inv-page inv-empty">
            <FaWarehouse className="inv-empty-icon" />
            <h2>Sección en construcción</h2>
            <p>Esta sección estará disponible próximamente.</p>
          </div>
        )}

      </main>
    </div>
  );
}