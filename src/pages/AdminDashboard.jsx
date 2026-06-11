import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  FaTicketAlt,
  FaClock,
  FaCheckCircle,
  FaStar,
  FaBell,
  FaEnvelope,
  FaUserCircle
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
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="content">

       
        <div className="topbar-pro">

          <div className="icons">
            <FaBell />
            <FaEnvelope />
          </div>

          <div className="user-info">
            <FaUserCircle className="avatar" />
            <div>
              <strong>{user?.area || "AdminIT"}</strong>
              <small>{user?.role || "Admin"}</small>
            </div>
          </div>

        </div>

        
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