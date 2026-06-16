import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  FaTicketAlt,
  FaClock,
  FaCheckCircle,
  FaStar,
  FaBell,
  FaEnvelope
} from "react-icons/fa";
import "./Dashboard.css";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    enProceso: 0,
    resueltos: 0,
    kpiVariaciones: { total: "+12%", proceso: "15 hoy", resueltos: "95%", satisfaccion: "0%" }
  });
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const cargarDatos = () => {
    fetch("http://localhost:3000/api/tickets")
      .then(res => res.json())
      .then(data => {
        setTickets(data);
        
       
        const total = data.length;
        const enProceso = data.filter(t => t.estado === "Creado" || t.estado === "En Proceso").length;
        const resueltos = data.filter(t => t.estado === "Resuelto" || t.estado === "Finalizado").length;
        
        setStats(prev => ({
          ...prev,
          totalTickets: total,
          enProceso: enProceso,
          resueltos: resueltos
        }));
      })
      .catch(err => console.error(err));

    
    fetch("http://localhost:3000/api/reportes/estadisticas")
      .then(res => res.json())
      .then(data => {
        if (data && data.totalTickets !== undefined) {
          setStats(prev => ({ ...data, kpiVariaciones: prev.kpiVariaciones }));
        }
      })
      .catch(err => {
  console.log("Nota: Usando conteo local en tiempo real del frontend.", err);
});
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const finalizarTicket = (id) => {
    fetch(`http://localhost:3000/api/tickets/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        estado: "Resuelto",
        solucion: "Ticket cerrado de manera exitosa desde el panel de administración." 
      })
    })
    .then(res => res.json())
    .then(() => {
      
      cargarDatos();
    })
    .catch(err => console.error("Error al finalizar ticket:", err));
  };

  const calcularProgresoPorcentaje = (prioridad) => {
    switch (prioridad) {
      case "Alta": return "85%";
      case "Media": return "60%";
      case "Baja": return "30%";
      default: return "15%";
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "stretch" }}>
      <Sidebar />

      <div className="content" style={{ flex: 1, overflowY: "auto" }}>
        
        {/* TOPBAR */}
        <div className="topbar-pro">
          <div className="top-actions">
            <div className="icon-wrapper">
              <FaBell className="topbar-icon" />
              <span className="badge-noti">3</span>
            </div>

            <FaEnvelope className="topbar-icon" />
            <div className="topbar-divider"></div>

            <div className="user-info-top">
              <div className="avatar-circle-top">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="user-text">
                <strong>{user?.email}</strong>
                <small>{user?.role}</small>
              </div>
            </div>
          </div>
        </div>

        
        <div className="kpi-pro">
          <div className="card-pro" style={{ position: "relative" }}>
            <span className="kpi-badge-green">{stats.kpiVariaciones?.total}</span>
            <FaTicketAlt className="icon orange" />
            <h2>{stats.totalTickets}</h2>
            <p>Tickets Totales</p>
          </div>

          <div className="card-pro" style={{ position: "relative" }}>
            <span className="kpi-badge-orange">{stats.kpiVariaciones?.proceso}</span>
            <FaClock className="icon blue" />
            <h2>{stats.enProceso}</h2>
            <p>En Proceso</p>
          </div>

          <div className="card-pro" style={{ position: "relative" }}>
            <span className="kpi-badge-green">{stats.kpiVariaciones?.resueltos}</span>
            <FaCheckCircle className="icon green" />
            <h2>{stats.resueltos}</h2>
            <p>Resueltos</p>
          </div>

          <div className="card-pro" style={{ position: "relative" }}>
            <span className="kpi-badge-gray">0%</span>
            <FaStar className="icon yellow" />
            <h2>0.0</h2> {/* Modificado de 4.6 a 0.0 por defecto para la encuesta automática */}
            <p>Satisfacción</p>
          </div>
        </div>

        {/* CONTENEDOR DE TICKETS ACTIVOS */}
        <div className="ticket-container">
          {tickets
            .filter(t => t.estado !== "Resuelto" && t.estado !== "Finalizado") 
            .map((t) => (
              <div key={t.id} className="ticket-card">
                <div className="ticket-header">
                  <span>#TK-{t.id}</span>
                  <span className={`badge ${t.prioridad ? t.prioridad.toLowerCase() : "baja"}`}>
                    {t.prioridad || "Baja"}
                  </span>
                </div>

                <h4>{t.tipo}</h4>
                <p>{t.descripcion}</p>

                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{ width: calcularProgresoPorcentaje(t.prioridad) }}
                  ></div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button
                    className="btn-open"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/chat/${t.id}`)}
                  >
                    Abrir
                  </button>
                  <button
                    className="btn-finalize"
                    style={{
                      flex: 1,
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "13px",
                      transition: "background-color 0.2s"
                    }}
                    onClick={() => finalizarTicket(t.id)}
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            ))}
            {tickets.filter(t => t.estado !== "Resuelto" && t.estado !== "Finalizado").length === 0 && (
              <p style={{ padding: "25px", color: "#666" }}>No hay incidentes pendientes por resolver. ¡Buen trabajo!</p>
            )}
        </div>

      </div>
    </div>
  );
}