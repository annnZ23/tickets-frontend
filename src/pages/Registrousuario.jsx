import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import iconLogin from "../assets/icon-login.png";
import control from "../assets/control de equipo.png";
import mantenimiento from "../assets/mantenimiento.png";
import seguimiento from "../assets/seguimiento.png";
import logo from "../assets/baprosa-logo.png";
import seguridad from "../assets/Seguridad.png";
import userIcon from "../assets/usuario.png";
import passIcon from "../assets/contraseña.png";

export default function RegistroUsuario() {
  const navigate = useNavigate();

  const [areas, setAreas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [areaId, setAreaId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [registrado, setRegistrado] = useState(null); // { username }

  useEffect(() => {
    const cargarAreas = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/areas-it");
        if (!res.ok) {
          console.error("areas-it respondió con error:", res.status, await res.text());
          setAreas([]);
          return;
        }
        const data = await res.json();
        console.log("Áreas recibidas del backend:", data);
        // "IT" queda reservada — los asesores (rol ADMIN) los crea SUPERADMIN
        // manualmente desde el panel de Usuarios, no por auto-registro.
        const areasPublicas = Array.isArray(data) ? data.filter((a) => a.nombre !== "IT") : [];
        setAreas(areasPublicas);
      } catch (err) {
        console.error("Error al conectar con areas-it:", err);
        setAreas([]);
      }
    };
    cargarAreas();
  }, []);

  const registrar = async () => {
    setError("");
    if (!nombre.trim() || !apellido.trim() || !areaId || !email.trim()) {
      setError("Completa todos los campos.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          areaId: Number(areaId),
          email: email.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || "No se pudo completar el registro.");
        setEnviando(false);
        return;
      }
      setRegistrado({ username: data.username });
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container">
      <img src={logo} className="logo" alt="Baprosa" />

      <div className="panel-left">
        <div className="icon-circle">
          <img src={iconLogin} alt="" />
        </div>
        <h2>Sistema de Inventario</h2>
        <p className="subtitle-left">Soporte Técnico IT</p>
        <div className="divider-line"></div>
        <div className="features">
          <div>
            <img src={control} alt="" />
            <span>Control de equipos y dispositivos</span>
          </div>
          <div>
            <img src={mantenimiento} alt="" />
            <span>Gestión de mantenimientos</span>
          </div>
          <div>
            <img src={seguimiento} alt="" />
            <span>Seguimiento de incidencias</span>
          </div>
        </div>
      </div>

      <div className="panel-right">
        {registrado ? (
          <div>
            <h3 style={{ margin: "0 0 6px" }}>¡Cuenta creada!</h3>
            <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, margin: "0 0 6px" }}>
              Tu usuario es: <strong style={{ color: "#1e293b" }}>{registrado.username}</strong>
            </p>
            <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>
              Te enviamos tu contraseña temporal al correo que registraste. Inicia sesión con ella —
              el sistema te pedirá definir tu propia contraseña.
            </p>
            <button className="btn-login" onClick={() => navigate("/")} style={{ marginTop: "14px" }}>
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          <>
            <h3>
              <img src={seguridad} alt="" />
              Crear cuenta
            </h3>

            <p className="login-text">
              Regístrate con tu nombre y el área a la que perteneces
            </p>

            <label className="form-label">Nombre</label>
            <div className="input-row">
              <img src={userIcon} className="input-icon" alt="" />
              <div className="input-group">
                <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
            </div>

            <label className="form-label">Apellido</label>
            <div className="input-row">
              <img src={userIcon} className="input-icon" alt="" />
              <div className="input-group">
                <input type="text" placeholder="Tu apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
              </div>
            </div>

            <label className="form-label">Área a la que perteneces</label>
            <div className="input-row">
              <img src={userIcon} className="input-icon" alt="" />
              <div className="input-group">
                <select
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "14px", padding: "10px 0" }}
                >
                  <option value="">Selecciona tu área...</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="form-label">Correo</label>
            <div className="input-row">
              <img src={passIcon} className="input-icon" alt="" />
              <div className="input-group">
                <input
                  type="email"
                  placeholder="tucorreo@baprosa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && registrar()}
                />
              </div>
            </div>

            {error && (
              <p style={{ color: "#e53e3e", fontSize: "12px", textAlign: "center", margin: "8px 0 0" }}>
                {error}
              </p>
            )}

            <button className="btn-login" onClick={registrar} disabled={enviando} style={{ marginTop: "14px" }}>
              {enviando ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            <p style={{ textAlign: "center", fontSize: "12.5px", color: "#64748b", margin: "14px 0 0" }}>
              ¿Ya tienes cuenta?{" "}
              <span onClick={() => navigate("/")} style={{ color: "#ff7f22", fontWeight: "700", cursor: "pointer" }}>
                Inicia sesión
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}