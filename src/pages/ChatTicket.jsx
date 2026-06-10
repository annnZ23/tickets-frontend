import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

export default function ChatTicket() {
  const { id } = useParams();

  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  
  useEffect(() => {
    fetch(`http://localhost:3000/api/messages/${id}`)
      .then(res => res.json())
      .then(data => setMensajes(data))
      .catch(err => console.error(err));
  }, [id]);

  
  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;

    try {
      const res = await fetch("http://localhost:3000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          texto: nuevoMensaje,
          ticketId: id
        })
      });

      const data = await res.json();

      setMensajes([...mensajes, data]);
      setNuevoMensaje("");

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="content" style={{ flex: 1, padding: "20px" }}>
        <h2>Chat Ticket #{id}</h2>

        <div
          style={{
            background: "#f5f5f5",
            padding: "15px",
            borderRadius: "10px",
            height: "300px",
            overflowY: "auto",
            marginBottom: "10px",
          }}
        >
          {mensajes.map((msg, i) => (
            <div
              key={i}
              style={{
                background: "#ff7a00",
                color: "white",
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "8px",
                maxWidth: "70%",
              }}
            >
              {msg.texto || msg.contenido}
            </div>
          ))}
        </div>

        
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe un mensaje..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={enviarMensaje}
            style={{
              background: "#ff7a00",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}