import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Chatbot from "./Chatbot";
import iconLogin from "../assets/icon-login.png";
import control from "../assets/control de equipo.png";
import mantenimiento from "../assets/mantenimiento.png";
import seguimiento from "../assets/seguimiento.png";
import logo from "../assets/baprosa-logo.png";
import seguridad from "../assets/Seguridad.png";
import userIcon from "../assets/usuario.png";
import passIcon from "../assets/contraseña.png";
import chatIcon from "../assets/chat.png";

// Modal obligatorio: aparece cuando el login responde passwordTemporal: true.
// No se puede cerrar sin definir una contraseña nueva.
function ModalCambiarPasswordObligatorio({ token, onCompletado }) {
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmar, setPasswordConfirmar] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setError("");
    if (passwordNueva.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (passwordNueva !== passwordConfirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/cambiar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ passwordNueva }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || "No se pudo actualizar la contraseña.");
        setGuardando(false);
        return;
      }
      onCompletado();
    } catch {
      setError("No se pudo conectar con el servidor.");
      setGuardando(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: "#fff", borderRadius: "14px", padding: "32px", width: "380px", boxShadow: "0 10px 40px rgba(0,0,0,0.25)" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: "18px", color: "#1e293b" }}>Define tu nueva contraseña</h3>
        <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#64748b" }}>
          Estás usando una contraseña temporal. Antes de continuar, crea una contraseña propia.
        </p>

        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Nueva contraseña</label>
        <input
          type="password"
          value={passwordNueva}
          onChange={(e) => setPasswordNueva(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #eef1f5", margin: "6px 0 14px", boxSizing: "border-box", fontSize: "13px" }}
        />

        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Confirmar contraseña</label>
        <input
          type="password"
          value={passwordConfirmar}
          onChange={(e) => setPasswordConfirmar(e.target.value)}
          placeholder="Repite la contraseña"
          onKeyDown={(e) => e.key === "Enter" && guardar()}
          style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #eef1f5", margin: "6px 0 14px", boxSizing: "border-box", fontSize: "13px" }}
        />

        {error && <p style={{ color: "#e53e3e", fontSize: "12px", margin: "0 0 12px" }}>{error}</p>}

        <button
          onClick={guardar}
          disabled={guardando}
          style={{ width: "100%", padding: "11px", borderRadius: "9px", border: "none", background: "#ff7f22", color: "#fff", fontWeight: "700", fontSize: "13.5px", cursor: guardando ? "default" : "pointer" }}
        >
          {guardando ? "Guardando..." : "Guardar y continuar"}
        </button>
      </div>
    </div>
  );
}

// Panel de "olvidé mi contraseña": pide usuario + correo, sin salir de la pantalla.
function PanelOlvidePassword({ onVolver }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    setError("");
    if (!username.trim() || !email.trim()) {
      setError("Escribe tu usuario y tu correo.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/olvide-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim().toLowerCase(), email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      setEnviado(true);
      if (!data.ok) setError(data.message || "");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div>
        <h3 style={{ margin: "0 0 10px" }}>Revisa tu correo</h3>
        <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>
          Si tus datos coinciden con una cuenta registrada, te enviamos una nueva contraseña temporal a tu correo.
          Inicia sesión con ella — el sistema te pedirá definir una nueva.
        </p>
        <button className="btn-forgot" onClick={onVolver} style={{ marginTop: "14px" }}>← Volver a iniciar sesión</button>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ margin: "0 0 6px" }}>Recuperar contraseña</h3>
      <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
        Ingresa tu usuario y tu correo registrado. Te enviaremos una nueva contraseña temporal.
      </p>

      <label className="form-label">Usuario</label>
      <div className="input-row">
        <img src={userIcon} className="input-icon" alt="" />
        <div className="input-group">
          <input type="text" placeholder="Tu usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
      </div>

      <label className="form-label">Correo registrado</label>
      <div className="input-row">
        <img src={passIcon} className="input-icon" alt="" />
        <div className="input-group">
          <input type="email" placeholder="tucorreo@baprosa.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar()} />
        </div>
      </div>

      {error && <p style={{ color: "#e53e3e", fontSize: "12px", margin: "8px 0 0" }}>{error}</p>}

      <button className="btn-login" onClick={enviar} disabled={enviando} style={{ marginTop: "14px" }}>
        {enviando ? "Enviando..." : "Enviar nueva contraseña"}
      </button>
      <button className="btn-forgot" onClick={onVolver} style={{ marginTop: "10px" }}>← Volver a iniciar sesión</button>
    </div>
  );
}

function Login({ setUsuario }) {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [usuarioInput, setUsuarioInput] = useState("");
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [vistaOlvide, setVistaOlvide] = useState(false);

  // Cuando el login detecta passwordTemporal, guardamos estos datos
  // y mostramos el modal obligatorio antes de dejarlo pasar al dashboard.
  const [pendienteCambio, setPendienteCambio] = useState(null); // { token, user }

  const irADashboard = (user) => {
    const role = user.role;
    if (role === "SUPERADMIN" || role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/crear");
    }
  };

  const handleLogin = async () => {
    setError("");

    if (!usuarioInput.trim() || !password.trim()) {
      setError("Escribe tu usuario y contraseña.");
      return;
    }

    setCargando(true);

    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: usuarioInput.trim().toLowerCase(),
          password: password.trim(),
          recordarme,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message || "Usuario o contraseña incorrectos.");
        setCargando(false);
        return;
      }

      // "Recordarme" ya se resolvió en el backend (duración del JWT: 30d vs 1d).
      // Guardamos siempre en localStorage porque el resto de la app
      // (EquipoNuevo, AsignacionTareas, etc.) ya lee el token de ahí.
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (setUsuario) setUsuario(data.user);

      if (data.passwordTemporal) {
        // No lo dejamos avanzar todavía — primero debe definir su contraseña real.
        setPendienteCambio({ token: data.token, user: data.user });
        setCargando(false);
        return;
      }

      irADashboard(data.user);
    } catch (err) {
      console.error("Error de login:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
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
        {vistaOlvide ? (
          <PanelOlvidePassword onVolver={() => setVistaOlvide(false)} />
        ) : (
          <>
            <h3>
              <img src={seguridad} alt="" />
              Iniciar Sesión
            </h3>

            <p className="login-text">
              Ingresa tus credenciales para acceder al sistema
            </p>

            <label className="form-label">Usuario</label>
            <div className="input-row">
              <img src={userIcon} className="input-icon" alt="" />
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Escribe tu usuario"
                  value={usuarioInput}
                  onChange={(e) => setUsuarioInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            <label className="form-label">Contraseña</label>
            <div className="input-row">
              <img src={passIcon} className="input-icon" alt="" />
              <div className="input-group password-group">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <span className="eye-icon" onClick={() => setShowPass(!showPass)}>👁</span>
              </div>
            </div>

            {error && (
              <p style={{ color: "#e53e3e", fontSize: "12px", textAlign: "center", margin: "8px 0 0" }}>
                {error}
              </p>
            )}

            <div className="options">
              <label>
                <input type="checkbox" checked={recordarme} onChange={(e) => setRecordarme(e.target.checked)} />
                Recordarme
              </label>
            </div>

            <button className="btn-login" onClick={handleLogin} disabled={cargando}>
              {cargando ? "Verificando..." : "Acceder al Sistema"}
            </button>

            <div className="separator">
              <span></span>
              <span>o</span>
              <span></span>
            </div>

            <button className="btn-forgot" onClick={() => setVistaOlvide(true)}>
              ¿Olvidaste tu contraseña?
            </button>

            <p style={{ textAlign: "center", fontSize: "12.5px", color: "#64748b", margin: "12px 0 0" }}>
              ¿No tienes cuenta?{" "}
              <span
                onClick={() => navigate("/registro")}
                style={{ color: "#ff7f22", fontWeight: "700", cursor: "pointer" }}
              >
                Regístrate
              </span>
            </p>

            <p className="support">
              ¿Necesitas ayuda?<br />
              <strong>practicait@baprosa.com</strong>
            </p>
          </>
        )}
      </div>

      <img src={chatIcon} alt="chat" className="chat-icon" />
      <Chatbot />

      {pendienteCambio && (
        <ModalCambiarPasswordObligatorio
          token={pendienteCambio.token}
          onCompletado={() => irADashboard(pendienteCambio.user)}
        />
      )}
    </div>
  );
}

export default Login;