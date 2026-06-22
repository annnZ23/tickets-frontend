import Sidebar from "../components/Sidebar";
import { FaSave, FaUserShield } from "react-icons/fa";

export default function Configuracion() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px" }}>
        <h2 style={{ color: "#1e293b", marginBottom: "24px" }}>⚙️ Configuración del Sistema</h2>
        <div style={{ background: "white", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "18px", color: "#334155", marginBottom: "20px", display: "flex", gap: "10px" }}>
            <FaUserShield /> Ajustes Generales
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Nombre del Sistema</label>
              <input type="text" defaultValue="Sistema IT Baprosa" style={{ padding: "12px", width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Correo de Notificaciones</label>
              <input type="email" defaultValue="soporte@baprosa.com" style={{ padding: "12px", width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            </div>
          </div>
          <button style={{ marginTop: "24px", background: "#ff7f22", color: "white", padding: "12px 24px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            <FaSave /> Guardar Cambios
          </button>
        </div>
      </main>
    </div>
  );
}