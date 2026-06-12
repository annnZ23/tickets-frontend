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
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch("http://localhost:3000/api/tickets")
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error(err));
  }, []);

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

        {/* KPI */}
        <div className="kpi-pro">

          <div className="card-pro">
            <FaTicketAlt className="icon orange" />
            <h2>{tickets.length}</h2>
            <p>Tickets Totales</p>
          </div>

          <div className="card-pro">
            <FaClock className="icon blue" />
            <h2>{tickets.filter(t => t.estado === "Creado").length}</h2>
            <p>En Proceso</p>
          </div>

          <div className="card-pro">
            <FaCheckCircle className="icon green" />
            <h2>{tickets.filter(t => t.estado === "Resuelto").length}</h2>
            <p>Resueltos</p>
          </div>

          <div className="card-pro">
            <FaStar className="icon yellow" />
            <h2>4.6</h2>
            <p>Satisfacción</p>
          </div>

        </div>

        {/* TICKETS */}
        <div className="ticket-container">
          {tickets.map((t) => (
            <div key={t.id} className="ticket-card">

              <div className="ticket-header">
                <span>#TK-{t.id}</span>
                <span className={`badge ${t.prioridad.toLowerCase()}`}>
                  {t.prioridad}
                </span>
              </div>

              <h4>{t.tipo}</h4>
              <p>{t.descripcion}</p>

              <div className="progress-bar">
                <div className="progress"></div>
              </div>

              <button
                className="btn-open"
                onClick={() => navigate(`/chat/${t.id}`)}
              >
                Abrir
              </button>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}