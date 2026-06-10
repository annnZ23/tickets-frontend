import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

export default function AdminDashboard() {

  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

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

       
        <div className="topbar">
          <div>Baprosa IT</div>
          <div>Admin</div>
        </div>

      
        <div className="kpi-container">
          <div className="kpi-card">
            <h2>{tickets.length}</h2>
            <p>Tickets Totales</p>
          </div>

          <div className="kpi-card">
            <h2>{tickets.filter(t => t.prioridad === "Alta").length}</h2>
            <p>Urgentes</p>
          </div>

          <div className="kpi-card">
            <h2>{tickets.filter(t => t.prioridad === "Media").length}</h2>
            <p>Medios</p>
          </div>
        </div>

        
        <div className="ticket-container">

          {tickets.map((t) => (
            <div key={t.id} className="ticket-card">

              <div className="ticket-header">
                <span>#TK-{t.id}</span>

                <span className={`badge ${t.prioridad === "Alta" ? "alta" : "media"}`}>
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