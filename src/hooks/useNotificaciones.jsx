import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("https://sistema-tickets-it.onrender.com");

export function useNotificaciones(usuario) {
  const [toasts, setToasts] = useState([]);

  const agregarToast = (notif) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...notif, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  useEffect(() => {
    if (!usuario?.id) return;

    socket.emit("join_personal_room", usuario.id);

    socket.on("nueva_subtarea", (data) => {
      agregarToast({
        ...data,
        color: "#ff7f22",
        icono: "📌",
      });
    });

    socket.on("subtarea_completada", (data) => {
      agregarToast({
        ...data,
        color: "#16a34a",
        icono: "✅",
      });
    });

    return () => {
      socket.off("nueva_subtarea");
      socket.off("subtarea_completada");
    };
  }, [usuario?.id]);

  return { toasts, socket };
}

export function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        display: "flex",
        flexDirection: "column-reverse",
        gap: "10px",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            backgroundColor: "#1e293b",
            color: "white",
            padding: "14px 18px",
            borderRadius: "12px",
            boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
            minWidth: "280px",
            maxWidth: "360px",
            borderLeft: `4px solid ${t.color || "#ff7f22"}`,
            pointerEvents: "auto",
            animation: "slideUp 0.3s ease",
          }}
        >
          <p style={{ margin: "0 0 3px 0", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
            {t.icono && <span>{t.icono}</span>}
            {t.titulo}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>
            {t.detalle}
          </p>
          {t.fechaLimite && (
            <p style={{ margin: "5px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
              Límite: {new Date(t.fechaLimite).toLocaleString("es-HN", {
                day: "2-digit", month: "short",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          )}
        </div>
      ))}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export { socket };
