import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { FaListUl, FaTools, FaCode, FaRoute, FaRegEnvelope, FaTimes } from "react-icons/fa";
import "./Dashboard.css";

export default function AsignacionTareas() {
  const [user] = useState(() => {
  const savedUser = localStorage.getItem("user");
  return savedUser ? JSON.parse(savedUser) : null;
});
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    assignedTo: "",
    email: "",
    area: "Soporte Técnico",
    priority: "Media",
    deadline: ""
  });
  
 const loadTasks = useCallback(async () => {
  if (!user?.email) return;
  try {

    const response = await fetch(
      `http://localhost:3000/api/tasks?email=${user.email}&role=${user.role}`
    );
    if (response.ok) {
      const data = await response.json();
      setTasks(data);
    }
  } catch (error) {
    console.error("Error al traer tareas:", error);
  }
}, [user]);
 
 useEffect(() => {
  const loadTasks = async () => {
    if (!user?.email) return;
    try {
      const response = await fetch(`http://localhost:3000/api/tasks?email=${user.email}&role=${user.role}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data); 
      }
    } catch (error) {
      console.error("Error al traer tareas:", error);
    }
  };

  loadTasks();
}, [user?.email, user?.role]); 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
          title: "",
          assignedTo: "",
          email: "",
          area: "Soporte Técnico",
          priority: "Media",
          deadline: ""
        });
        loadTasks();
      } else {
        alert("Error al guardar la tarea");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const areasDefinidas = [
    { nombre: "Soporte Técnico", icono: <FaTools className="area-icon text-orange" /> },
    { nombre: "Desarrollo Web", icono: <FaCode className="area-icon text-orange" /> },
    { nombre: "Analista de Rutas", icono: <FaRoute className="area-icon text-orange" /> }
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100vw", overflowX: "hidden" }}>
      <Sidebar />

      <div className="content" style={{ flex: 1, padding: "20px", background: "#f8f9fa", minWidth: 0 }}>
        {/* Barra superior */}
        <div className="topbar-pro" style={{ width: "100%" }}>
          <div className="top-actions">
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

        <div className="tareas-layout-container" style={{ width: "100%", maxWidth: "100%", marginTop: "20px" }}>
          <div className="tareas-card-main" style={{ width: "100%", padding: "25px" }}>
            <div className="tareas-header-row">
              <div className="tareas-title-flex">
                <FaListUl className="title-list-icon" />
                <h3>Asignación Tareas IT</h3>
              </div>
              {user?.role === "ADMIN" && (
                <button className="btn-asignar-orange" onClick={() => setShowModal(true)}>
                  + Asignar
                </button>
              )}
            </div>

            <div className="areas-stack" style={{ width: "100%" }}>
              {areasDefinidas.map((area) => {
                const tareasDelArea = tasks.filter((t) => t.area === area.nombre);

                if (user?.role === "USER" && tareasDelArea.length === 0) return null;

                return (
                  <div key={area.nombre} className="area-group-box" style={{ width: "100%", marginBottom: "20px" }}>
                    <div className="area-title-inline">
                      {area.icono} <span>{area.nombre}</span>
                    </div>

                    <div className="tareas-list-box">
                      {tareasDelArea.length === 0 ? (
                        <p style={{ padding: "15px", color: "#888", fontSize: "14px" }}>
                          Sin tareas asignadas en esta área.
                        </p>
                      ) : (
                        tareasDelArea.map((tarea, idx) => (
                          <div key={tarea.id || idx} className="single-tarea-item">
                            {idx > 0 && <div className="tarea-divider-line" />}
                            <h4 className="tarea-item-title">{tarea.title}</h4>
                            <p className="tarea-meta-text">Asignado a: {tarea.assignedTo}</p>
                            <p className="tarea-meta-text email-flex">
                              <FaRegEnvelope /> {tarea.email}
                            </p>
                            <div className="tarea-footer-row">
                              <span className={`badge-task ${tarea.priority?.toLowerCase()}`}>
                                {tarea.priority}
                              </span>
                              <span className="deadline-text">Vence: {tarea.deadline}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "12px", width: "450px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "#333" }}>Asignar Nueva Tarea IT</h3>
              <FaTimes style={{ cursor: "pointer", color: "#666" }} onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold", fontSize: "14px" }}>
                Título de la Tarea:
                <input type="text" required style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", marginTop: "5px" }} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold", fontSize: "14px" }}>
                Nombre del Encargado (Asesor):
                <input type="text" required placeholder="Ej. Ana Zepeda" style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", marginTop: "5px" }} value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold", fontSize: "14px" }}>
                Correo del Encargado:
                <input type="email" required placeholder="a.zepeda@Baprosa.com" style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", marginTop: "5px" }} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </label>

              <div style={{ display: "flex", gap: "10px" }}>
                <label style={{ flex: 1, display: "flex", flexDirection: "column", fontWeight: "bold", fontSize: "14px" }}>
                  Área IT:
                  <select style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", marginTop: "5px" }} value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })}>
                    <option value="Soporte Técnico">Soporte Técnico</option>
                    <option value="Desarrollo Web">Desarrollo Web</option>
                    <option value="Analista de Rutas">Analista de Rutas</option>
                  </select>
                </label>

                <label style={{ flex: 1, display: "flex", flexDirection: "column", fontWeight: "bold", fontSize: "14px" }}>
                  Prioridad:
                  <select style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", marginTop: "5px" }} value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold", fontSize: "14px" }}>
                Fecha de Vencimiento:
                <input type="text" placeholder="Ej. 25 Dic 2026" required style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", marginTop: "5px" }} value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
              </label>

              <button type="submit" style={{ backgroundColor: "#ff7f22", color: "white", padding: "10px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>
                Guardar Tarea
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}