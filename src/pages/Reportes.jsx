import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaChartBar, FaFileExcel, FaBell, FaEnvelope } from "react-icons/fa";
import "./Dashboard.css"; 

export default function Reportes() {
  const [historial, setHistorial] = useState([]);
  const [estadisticas, setEstadisticas] = useState({ totalTickets: 0, resueltos: 0, porArea: [] });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    let unmounted = false;

    const obtenerDatos = async () => {
      try {
        setLoading(true);
        const resHistorial = await fetch("http://localhost:3000/api/reportes/historial");
        const dataHistorial = await resHistorial.json();

        const resStats = await fetch("http://localhost:3000/api/reportes/estadisticas");
        const dataStats = await resStats.json();

        if (!unmounted) {
          setHistorial(Array.isArray(dataHistorial) ? dataHistorial : []);
          setEstadisticas(dataStats);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error cargando reportes en el panel:", err);
        if (!unmounted) setLoading(false);
      }
    };

    obtenerDatos();

    return () => {
      unmounted = true;
    };
  }, []); 

  const manejarExportacion = () => {
    fetch("http://localhost:3000/api/reportes/exportar")
      .then((res) => res.json())
      .then((data) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `Reporte_Baprosa_Tickets_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      })
      .catch((err) => console.error("Error exportando:", err));
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

        
        <div style={{ padding: "30px" }}>
          
          <div style={{ display: "flex", alignItems: "center", mb: "30px", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaChartBar style={{ fontSize: "28px", color: "#ff7f22" }} />
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#333" }}>
                Historial de Reportes y Auditoría IT
              </h2>
            </div>
            
            <button
              onClick={manejarExportacion}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#2e7d32",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(0,0,0,0.15)"
              }}
            >
              <FaFileExcel /> Exportar Documentos
            </button>
          </div>

          <div className="kpi-pro" style={{ marginBottom: "30px", marginTop: "20px" }}>
            <div className="card-pro">
              <h2>{estadisticas.totalTickets || 0}</h2>
              <p>Histórico Total Creados</p>
            </div>
            <div className="card-pro">
              <h2>{estadisticas.resueltos || 0}</h2>
              <p>Tickets Finalizados Totales</p>
            </div>
            <div className="card-pro">
              <h2>{estadisticas.ticketsBaproChat || 0}</h2>
              <p>Autogenerados por IA</p>
            </div>
          </div>

         
          <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #eee", backgroundColor: "#fafafa" }}>
              <h3 style={{ margin: 0, color: "#444", fontSize: "16px" }}>Registro de Tickets Resueltos</h3>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f1f3f5", color: "#666", fontSize: "13px", borderBottom: "2px solid #dee2e6" }}>
                    <th style={{ padding: "15px" }}>ID</th>
                    <th style={{ padding: "15px" }}>Tipo Incidente</th>
                    <th style={{ padding: "15px" }}>Descripción Base</th>
                    <th style={{ padding: "15px" }}>Prioridad</th>
                    <th style={{ padding: "15px" }}>Estado</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "14px", color: "#444" }}>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#888" }}>
                        Cargando registros históricos...
                      </td>
                    </tr>
                  ) : historial.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#888" }}>
                        No hay tickets finalizados aún.
                      </td>
                    </tr>
                  ) : (
                    historial.map((tk) => (
                      <tr key={tk.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "15px", fontWeight: "bold", color: "#ff7f22" }}>#TK-{tk.id}</td>
                        <td style={{ padding: "15px", fontWeight: "500" }}>{tk.tipo}</td>
                        <td style={{ padding: "15px", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {tk.descripcion}
                        </td>
                        <td style={{ padding: "15px" }}>
                          <span className={`badge ${tk.prioridad?.toLowerCase() || "baja"}`} style={{ display: "inline-block", padding: "3px 8px", borderRadius: "4px", fontSize: "11px" }}>
                            {tk.prioridad || "Baja"}
                          </span>
                        </td>
                        <td style={{ padding: "15px" }}>
                          <span style={{ backgroundColor: "#d4edda", color: "#155724", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                            {tk.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}