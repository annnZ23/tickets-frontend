import { useState } from "react";
import { useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import logo from "../assets/baprosa-logo.png";

export default function EncuestaSatisfaccion() {
  const { id } = useParams();
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const handleEnviar = async () => {
    if (calificacion === 0) {
      setError("Por favor selecciona una calificación de 1 a 5 estrellas.");
      return;
    }

    setError("");
    setEnviando(true);

    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${id}/encuesta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calificacion, comentario }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo registrar tu calificación.");
        setEnviando(false);
        return;
      }

      setEnviado(true);
    } catch (err) {
      console.error("Error al enviar encuesta:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <img src={logo} alt="Baprosa" style={{ width: "130px", marginBottom: "20px" }} />
          <h2 style={{ color: "#1e293b" }}>¡Gracias por tu respuesta!</h2>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Tu opinión nos ayuda a mejorar el servicio de soporte técnico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={logo} alt="Baprosa" style={{ width: "130px", marginBottom: "20px" }} />
        <h2 style={{ color: "#1e293b", marginBottom: "8px" }}>¿Cómo fue tu experiencia?</h2>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
          Califica el soporte que recibiste en el ticket #{id}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
          {[1, 2, 3, 4, 5].map((valor) => (
            <FaStar
              key={valor}
              size={36}
              style={{ cursor: "pointer", transition: "color 0.15s" }}
              color={valor <= (hover || calificacion) ? "#ff7f22" : "#e2e8f0"}
              onClick={() => setCalificacion(valor)}
              onMouseEnter={() => setHover(valor)}
              onMouseLeave={() => setHover(0)}
            />
          ))}
        </div>

        <textarea
          placeholder="¿Algo que quieras contarnos? (opcional)"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={4}
          style={styles.textarea}
        />

        {error && (
          <p style={{ color: "#e53e3e", fontSize: "13px", marginTop: "10px" }}>{error}</p>
        )}

        <button onClick={handleEnviar} disabled={enviando} style={styles.boton}>
          {enviando ? "Enviando..." : "Enviar calificación"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF3E6",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "40px",
    maxWidth: "420px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "13px",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  boton: {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#ff7f22",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};