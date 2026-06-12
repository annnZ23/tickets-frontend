import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./dashboard.css";

export default function RegisterTicket() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [tipo, setTipo] = useState("");
  const [estado] = useState("Creado");
  const [urgencia, setUrgencia] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [nombre] = useState(user ? user.name : "");
  const [correo] = useState(user ? user.email : "");
  const [descripcion, setDescripcion] = useState("");
  const [asesor, setAsesor] = useState("");
  const [correoAsesor, setCorreoAsesor] = useState("");
  const [notificar, setNotificar] = useState("");
  const [loading, setLoading] = useState(false); // ✅ correcto

  const obtenerCorreoAsesor = (nombre) => {
    switch (nombre) {
      case "Ing Manuel Flores": return "manuel@empresa.com";
      case "Ing Luis Salgado": return "luis@empresa.com";
      case "Ing Fredy Fajardo": return "fredy@empresa.com";
      case "Ing Arnol Sanchez": return "arnol@empresa.com";
      case "Lic Ana Zepeda": return "ana@empresa.com";
      default: return "";
    }
  };

  const calcularPrioridad = (tipo, urgencia) => {
    if (tipo === "Incidente" && urgencia === "Alta") return "Alta";
    if (tipo === "Problema") return "Media";
    if (tipo === "Solicitud de información") return "Baja";
    return "Media";
  };

  const actualizarPrioridad = (nuevoTipo, nuevaUrgencia) => {
    const p = calcularPrioridad(
      nuevoTipo || tipo,
      nuevaUrgencia || urgencia
    );
    setPrioridad(p);
  };

  const crearTicket = async () => {
    // ✅ Validación básica antes de enviar
    if (!tipo || !descripcion) {
      alert("Por favor completa el tipo y la descripción");
      return;
    }

    try {
      setLoading(true); // ✅ activa el loading

      const res = await fetch("http://127.0.0.1:3000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          correo,
          tipo,
          descripcion,
          prioridad,
        }),
      });

      const data = await res.json();

      if (!data.id) {
        alert("Error al crear ticket");
        return;
      }

      navigate(`/chat/${data.id}`);

    } catch (error) {
      console.error(error);
      alert("Error al crear ticket");
    } finally {
      setLoading(false); // ✅ siempre desactiva al terminar
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "stretch" }}>
      <Sidebar />

      <div className="content" style={{ flex: 1, overflowY: "auto" }}>

        <div style={{ padding: "20px 25px" }}>
          <h2 style={{ marginBottom: "15px" }}>Nuevo incidente</h2>
        </div>

        <div className="form-box" style={{ margin: "0 25px 25px", maxWidth: "900px" }}>

          <div className="grid">
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                actualizarPrioridad(e.target.value, null);
              }}
            >
              <option value="">Tipo de solicitud</option>
              <option>Incidente</option>
              <option>Problema</option>
              <option>Servicio de mantenimiento</option>
              <option>Solicitud de información</option>
            </select>

            <input value={prioridad} placeholder="Prioridad" readOnly />
          </div>

          <div className="grid">
            <input value={estado} readOnly />

            <select
              value={urgencia}
              onChange={(e) => {
                setUrgencia(e.target.value);
                actualizarPrioridad(null, e.target.value);
              }}
            >
              <option value="">Urgencia</option>
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>
          </div>

          <h3>Datos del solicitante</h3>

          <div className="grid">
            <input value={nombre} readOnly />
            <input value={correo} readOnly />
          </div>

          <div className="grid">
            <select>
              <option>Área</option>
              <option>Soporte Técnico</option>
              <option>Desarrollo Web</option>
            </select>

            <select
              value={asesor}
              onChange={(e) => {
                const value = e.target.value;
                setAsesor(value);
                setCorreoAsesor(obtenerCorreoAsesor(value));
              }}
            >
              <option>Asesor</option>
              <option>Ing Manuel Flores</option>
              <option>Ing Luis Salgado</option>
              <option>Ing Fredy Fajardo</option>
              <option>Ing Arnol Sanchez</option>
            </select>
          </div>

          <input value={correoAsesor} placeholder="Correo del asesor" readOnly />

          <div className="full">
            <label className="label">Correos a notificar</label>
            <input
              placeholder="ejemplo@correo.com"
              value={notificar}
              onChange={(e) => setNotificar(e.target.value)}
            />
          </div>

          <input className="full" placeholder="Asunto" />

          <textarea
            className="full"
            placeholder="Describe el problema detalladamente..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{ minHeight: "140px" }}
          />

          <div className="upload">
            Arrastra archivos aquí
          </div>

          <div className="buttons">
            <button
              className="btn-primary"
              onClick={crearTicket}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Creando..." : "Crear Ticket"}
            </button>

            <button
              className="btn-light"
              onClick={() => navigate("/admin")}
            >
              Cancelar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}