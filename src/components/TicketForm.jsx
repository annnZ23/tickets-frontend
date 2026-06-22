import { useState } from "react";
function TicketForm({
  setVista,
  setTickets,
  setTicketSeleccionado
}) {

  const [plantilla, setPlantilla] = useState("");
  const [tipo, setTipo] = useState("");
  const [area, setArea] = useState("");
  const [asesor, setAsesor] = useState("");
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivos, setArchivos] = useState([]);

  const plantillas = {
    Laptop: "Incidente",
    Internet: "Incidente",
    Cámaras: "Incidente",
    Clientes: "Solicitud",
    Pagos: "Solicitud",
    "Bug web": "Problema"
  };

  const handlePlantilla = (value) => {
    setPlantilla(value);
    setTipo(plantillas[value] || "");
  };

  const handleFiles = (files) => {
    const lista = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setArchivos(lista);
  };

 
  const crearTicket = async () => {
    if (!asunto || !descripcion) {
      alert("Completa los campos obligatorios");
      return;
    }

    try {
      
      const formData = new FormData();
      formData.append("nombre", asunto);
      formData.append("correo", "usuario@empresa.com");
      formData.append("tipo", tipo);
      formData.append("descripcion", descripcion);
      formData.append("prioridad", "Media"); 
      if (archivos.length > 0) {
        formData.append("file", archivos[0].file);
      }

      const response = await fetch("http://localhost:3000/api/tickets", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        const nuevoTicket = {
          ...data,
          asunto,
          descripcion,
          area,
          asesor,
          tipo,
          plantilla,
          archivos,
          fecha: new Date().toLocaleString()
        };

        setTickets((prev) => [...prev, nuevoTicket]);
        setTicketSeleccionado(nuevoTicket);
        setVista("ticket");

        alert("Ticket creado correctamente");
      } else {
        alert("Error en el servidor al procesar el ticket");
      }

    } catch (error) {
      console.error(error);
      alert("Error al guardar el ticket");
    }
  };

  return (
    <div style={container}>
      <h2>Nuevo incidente</h2>

      <div style={grid}>
       
        <div style={field}>
          <label>Plantilla</label>
          <select
            value={plantilla}
            onChange={(e) => handlePlantilla(e.target.value)}
            style={input}
          >
            <option value="">Seleccionar</option>
            {Object.keys(plantillas).map((p, i) => (
              <option key={i}>{p}</option>
            ))}
          </select>
        </div>

        
        <div style={field}>
          <label>Tipo</label>
          <input value={tipo} disabled style={input} />
        </div>

        
        <div style={field}>
          <label>Área</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            style={input}
          >
            <option value="">Seleccionar</option>
            <option>Soporte IT</option>
            <option>Desarrollo web</option>
          </select>
        </div>

        <div style={field}>
          <label>Asesor</label>
          <select
            value={asesor}
            onChange={(e) => setAsesor(e.target.value)}
            style={input}
          >
            <option value="">Seleccionar</option>
            <option>Ing Manuel</option>
            <option>Ing Luis</option>
          </select>
        </div>
      </div>

      <div style={field}>
        <label>Asunto</label>
        <input
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          style={input}
        />
      </div>

      
      <div style={field}>
        <label>Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={input}
        />
      </div>

      
      <div style={field}>
        <label>Adjuntos</label>
        <input
          type="file"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      
      <div style={previewBox}>
        {archivos.map((a, i) => {
          if (a.file.type.startsWith("image")) {
            return (
              <img key={i} src={a.preview} alt="preview" style={imgPreview} />
            );
          }
          if (a.file.type.startsWith("video")) {
            return (
              <video key={i} src={a.preview} controls style={videoPreview} />
            );
          }
          if (a.file.type.startsWith("audio")) {
            return (
              <audio key={i} src={a.preview} controls />
            );
          }
          return <div key={i}>📎 {a.file.name}</div>;
        })}
      </div>

      <button style={btn} onClick={crearTicket}>
        Crear Ticket
      </button>
    </div>
  );
}

export default TicketForm;

// Estilos fijos para la visualización (se mantienen igual)
const container = { background: "white", padding: "30px", borderRadius: "16px", maxWidth: "900px", margin: "auto", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0px 8px 25px rgba(0,0,0,0.08)" };
const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };
const field = { display: "flex", flexDirection: "column", gap: "6px" };
const input = { padding: "12px", borderRadius: "10px", border: "1px solid #ddd" };
const previewBox = { display: "flex", gap: "10px", flexWrap: "wrap" };
const imgPreview = { width: "120px", borderRadius: "10px" };
const videoPreview = { width: "180px", borderRadius: "10px" };
const btn = { background: "linear-gradient(135deg, #ff7a00, #ff5500)", color: "white", padding: "14px", border: "none", borderRadius: "12px", cursor: "pointer" };