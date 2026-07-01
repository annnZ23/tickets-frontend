import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./dashboard.css";

const colors = {
  naranja: "#ff7f22",
  naranjaOscuro: "#e66a10",
  naranjaClaro: "#fff1e6",
  texto: "#1e293b",
  textoSec: "#64748b",
  textoMuted: "#94a3b8",
  borde: "#eef1f5",
  fondo: "#f4f6f8",
  rojo: "#dc2626",
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "9px",
  border: `1px solid ${colors.borde}`,
  fontSize: "13.5px",
  color: colors.texto,
  outline: "none",
  backgroundColor: "#fafbfc",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease, background-color 0.15s ease",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "700",
  color: colors.textoSec,
  marginBottom: "6px",
};

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

  const [area, setArea] = useState("");

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
          area,
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

  // Helper de foco naranja consistente para inputs/selects nativos
  const onFocusNaranja = (e) => {
    e.target.style.borderColor = colors.naranja;
    e.target.style.backgroundColor = "#ffffff";
  };
  const onBlurDefault = (e) => {
    e.target.style.borderColor = colors.borde;
    e.target.style.backgroundColor = "#fafbfc";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap"
        rel="stylesheet"
      />
      <Sidebar />

      <div style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
        <h2
          style={{
            margin: "0 0 22px 0",
            fontSize: "22px",
            fontWeight: "800",
            color: colors.texto,
            fontFamily: "'Manrope', 'Segoe UI', sans-serif",
            letterSpacing: "-0.3px",
          }}
        >
          Nuevo incidente
        </h2>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            border: `1px solid ${colors.borde}`,
            padding: "32px",
            maxWidth: "760px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div>
              <label style={labelStyle}>Tipo de solicitud</label>
              <select
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value);
                  actualizarPrioridad(e.target.value, null, null);
                }}
                style={inputStyle}
                onFocus={onFocusNaranja}
                onBlur={onBlurDefault}
              >
                <option value="">Selecciona una opción</option>
                <option>Incidente</option>
                <option>Problema</option>
                <option>Solicitud de mantenimiento</option>
                <option>Solicitud de información</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Impacto</label>
              <select
                value={impacto}
                onChange={(e) => {
                  setImpacto(e.target.value);
                  actualizarPrioridad(null, null, e.target.value);
                }}
                style={inputStyle}
                onFocus={onFocusNaranja}
                onBlur={onBlurDefault}
              >
                <option value="">Selecciona una opción</option>
                <option>Alto</option>
                <option>Medio</option>
                <option>Bajo</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div>
              <label style={labelStyle}>Estado</label>
              <input value={estado} readOnly style={{ ...inputStyle, color: colors.textoSec, cursor: "default" }} />
            </div>
            <div>
              <label style={labelStyle}>Prioridad</label>
              <input
                value={prioridad}
                placeholder="Se calcula automáticamente"
                readOnly
                style={{
                  ...inputStyle,
                  color: prioridad === "Alta" ? colors.rojo : colors.naranja,
                  fontWeight: "700",
                  cursor: "default",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div>
              <label style={labelStyle}>Urgencia</label>
              <select
                value={urgencia}
                onChange={(e) => {
                  setUrgencia(e.target.value);
                  actualizarPrioridad(null, e.target.value, null);
                }}
                style={inputStyle}
                onFocus={onFocusNaranja}
                onBlur={onBlurDefault}
              >
                <option value="">Selecciona una opción</option>
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Detalles del impacto</label>
              <input
                placeholder="Ej. afecta a todo el departamento"
                value={detallesImpacto}
                onChange={(e) => setDetallesImpacto(e.target.value)}
                style={inputStyle}
                onFocus={onFocusNaranja}
                onBlur={onBlurDefault}
              />
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${colors.fondo}`, paddingTop: "20px", marginTop: "4px" }}>
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "14px",
                fontWeight: "700",
                color: colors.texto,
                fontFamily: "'Manrope', 'Segoe UI', sans-serif",
              }}
            >
              Datos del solicitante
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input value={nombre} readOnly style={{ ...inputStyle, color: colors.textoSec, cursor: "default" }} />
              </div>
              <div>
                <label style={labelStyle}>Correo institucional</label>
                <input value={correo} readOnly style={{ ...inputStyle, color: colors.textoSec, cursor: "default" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div>
              <label style={labelStyle}>Área (informativo)</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                style={inputStyle}
                onFocus={onFocusNaranja}
                onBlur={onBlurDefault}
              >
                <option value="">Selecciona una opción</option>
                <option>Soporte Técnico</option>
                <option>Desarrollo Web</option>
                <option>Analista de Rutas</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Asesor</label>
              <select
                value={asesorId}
                onChange={(e) => setAsesorId(e.target.value)}
                disabled={cargandoAsesores}
                style={{ ...inputStyle, cursor: cargandoAsesores ? "wait" : "pointer" }}
                onFocus={onFocusNaranja}
                onBlur={onBlurDefault}
              >
                <option value="">
                  {cargandoAsesores ? "Cargando asesores..." : "Selecciona un asesor"}
                </option>
                {asesores.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.area?.nombre || "IT"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Asunto</label>
            <input
              placeholder="Resume el incidente en pocas palabras"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              style={inputStyle}
              onFocus={onFocusNaranja}
              onBlur={onBlurDefault}
            />
          </div>

          <div>
            <label style={labelStyle}>Descripción del problema</label>
            <textarea
              placeholder="Describe con detalle qué está pasando"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              onFocus={onFocusNaranja}
              onBlur={onBlurDefault}
            />
          </div>

          <div
            style={{
              border: `1.5px dashed ${colors.borde}`,
              borderRadius: "10px",
              padding: "28px",
              textAlign: "center",
              color: colors.textoMuted,
              fontSize: "13px",
              backgroundColor: colors.fondo,
            }}
          >
            Arrastra archivos aquí
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
            <button
              onClick={crearTicket}
              disabled={enviando}
              style={{
                backgroundColor: enviando ? colors.naranjaOscuro : colors.naranja,
                color: "white",
                border: "none",
                padding: "12px 26px",
                borderRadius: "9px",
                fontSize: "13.5px",
                fontWeight: "700",
                cursor: enviando ? "default" : "pointer",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!enviando) e.currentTarget.style.backgroundColor = colors.naranjaOscuro;
              }}
              onMouseLeave={(e) => {
                if (!enviando) e.currentTarget.style.backgroundColor = colors.naranja;
              }}
            >
              {enviando ? "Creando..." : "Crear ticket"}
            </button>

            <button
              onClick={() => navigate(-1)}
              style={{
                backgroundColor: "#ffffff",
                color: colors.textoSec,
                border: `1px solid ${colors.borde}`,
                padding: "12px 26px",
                borderRadius: "9px",
                fontSize: "13.5px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.fondo)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}