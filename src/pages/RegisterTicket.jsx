import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./dashboard.css";

export default function RegisterTicket() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem("token");

  const [tipo, setTipo] = useState("");
  const [impacto, setImpacto] = useState("");
  const [estado] = useState("Creado");
  const [urgencia, setUrgencia] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [nombre] = useState(user ? user.name : "");
  const [correo] = useState(user ? user.email : "");
  const [descripcion, setDescripcion] = useState("");
  const [asunto, setAsunto] = useState("");
  const [detallesImpacto, setDetallesImpacto] = useState("");

  // Área: solo informativo, no filtra el selector de Asesor
  const [area, setArea] = useState("");

  // Lista de asesores (ADMIN/SUPERADMIN) cargada desde el backend
  const [asesores, setAsesores] = useState([]);
  const [asesorId, setAsesorId] = useState("");
  const [cargandoAsesores, setCargandoAsesores] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const fetchAsesores = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/usuarios", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("No se pudo cargar la lista de asesores");
        const data = await res.json();
        // Solo IT (ADMIN/SUPERADMIN) puede recibir tickets; los USER (empleados) no
        const soloAsesores = data.filter(
          (u) => u.role === "ADMIN" || u.role === "SUPERADMIN"
        );
        setAsesores(soloAsesores);
      } catch (err) {
        console.error("Error al cargar asesores:", err);
      } finally {
        setCargandoAsesores(false);
      }
    };
    fetchAsesores();
  }, [token]);

  const calcularPrioridad = (tipo, urgencia, impacto) => {
    if (tipo === "Incidente" && urgencia === "Alta") return "Alta";
    if (tipo === "Problema") return "Media";
    if (tipo === "Solicitud de información") return "Baja";
    return "Media";
  };

  const actualizarPrioridad = (nuevoTipo, nuevaUrgencia, nuevoImpacto) => {
    const p = calcularPrioridad(
      nuevoTipo || tipo,
      nuevaUrgencia || urgencia,
      nuevoImpacto || impacto
    );
    setPrioridad(p);
  };

  const crearTicket = async () => {
    if (!tipo) {
      alert("Selecciona el tipo de solicitud");
      return;
    }
    if (!asesorId) {
      alert("Selecciona un asesor para atender tu incidente");
      return;
    }
    if (!asunto.trim()) {
      alert("Escribe un asunto para el ticket");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("http://localhost:3000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nombre,
          correo,
          tipo,
          prioridad,
          descripcion: `${asunto}${detallesImpacto ? " — " + detallesImpacto : ""}\n\n${descripcion}`,
          area, // dato informativo, no filtra asesores
          usuarioId: user?.id || null,
          adminIds: [Number(asesorId)],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al crear ticket");
        setEnviando(false);
        return;
      }

      navigate(`/chat/${data.ticket.id}`);
    } catch (error) {
      console.error(error);
      alert("Error al crear ticket");
      setEnviando(false);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="content">
        <h2>Nuevo incidente</h2>

        <div className="form-box">
          <div className="grid">
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                actualizarPrioridad(e.target.value, null, null);
              }}
            >
              <option value="">Tipo de solicitud</option>
              <option>Incidente</option>
              <option>Problema</option>
              <option>Solicitud de mantenimiento</option>
              <option>Solicitud de información</option>
            </select>

            <select
              value={impacto}
              onChange={(e) => {
                setImpacto(e.target.value);
                actualizarPrioridad(null, null, e.target.value);
              }}
            >
              <option value="">Impacto</option>
              <option>Alto</option>
              <option>Medio</option>
              <option>Bajo</option>
            </select>
          </div>

          <div className="grid">
            <input value={estado} readOnly />
            <input value={prioridad} placeholder="Prioridad" readOnly />
          </div>

          <div className="grid">
            <select
              value={urgencia}
              onChange={(e) => {
                setUrgencia(e.target.value);
                actualizarPrioridad(null, e.target.value, null);
              }}
            >
              <option value="">Urgencia</option>
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>

            <input
              placeholder="Detalles del impacto"
              value={detallesImpacto}
              onChange={(e) => setDetallesImpacto(e.target.value)}
            />
          </div>

          <h3>Datos del solicitante</h3>
          <div className="grid">
            <input value={nombre} readOnly />
            <input value={correo} readOnly />
          </div>

          {/* FILA 5 — Área es solo informativa, no filtra el selector de Asesor */}
          <div className="grid">
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Área</option>
              <option>Soporte Técnico</option>
              <option>Desarrollo Web</option>
              <option>Analista de Rutas</option>
            </select>

            <select
              value={asesorId}
              onChange={(e) => setAsesorId(e.target.value)}
              disabled={cargandoAsesores}
            >
              <option value="">
                {cargandoAsesores ? "Cargando asesores..." : "Asesor"}
              </option>
              {asesores.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.area?.nombre || "IT"})
                </option>
              ))}
            </select>
          </div>

          <input
            className="full"
            placeholder="Asunto"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
          />

          <input
            className="full"
            placeholder="Descripción del problema"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <div className="upload">Arrastra archivos aquí</div>

          <div className="buttons">
            <button
              className="btn-primary"
              onClick={crearTicket}
              disabled={enviando}
            >
              {enviando ? "Creando..." : "Crear Ticket"}
            </button>

            <button className="btn-light" onClick={() => navigate(-1)}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}