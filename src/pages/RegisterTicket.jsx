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
  const [loading, setLoading] = useState(false);

  
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

    if (!tipo || !descripcion) {
      alert("Completa tipo y descripción");
      return;
    }

    setLoading(true);

    try {
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
})

      });

      const data = await res.json();

      console.log("TICKET:", data);

      if (!data.id) {
        alert("Error al crear ticket");
        setLoading(false);
        return;
      }

     
      navigate(`/chat/${data.id}`);

    } catch (error) {
      console.error(error);
      alert("Error al crear ticket");
    }

    setLoading(false);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="content">
        <h2>Nuevo incidente</h2>

        <div className="form-box">

          {/* TIPO + PRIORIDAD */}
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
            style={{ minHeight: "150px", resize: "none" }}
          />

          <div className="upload">
            Arrastre y suelte los archivos aquí
          </div>

         
          <div className="buttons">
            <button
              className="btn-primary"
              onClick={crearTicket}
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Ticket"}
            </button>

            <button className="btn-light">Cancelar</button>
          </div>

        </div>
      </div>
    </div>
  );
}