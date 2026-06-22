import { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [areas, setAreas] = useState([]);
  
  const [nuevoUsuario, setNuevoUsuario] = useState({ name: '', email: '', password: '', role: 'ADMIN', area: '' });
  const [nuevaArea, setNuevaArea] = useState('');

  // Encapsulación correcta de la consulta asíncrona al backend
  const cargarDatosSistematicos = async () => {
    try {
      const resUsers = await fetch("http://localhost:3000/api/usuarios");
      const dataUsers = await resUsers.json();
      setUsuarios(Array.isArray(dataUsers) ? dataUsers : []);

      const resAreas = await fetch("http://localhost:3000/api/areas-it");
      const dataAreas = await resAreas.json();
      setAreas(Array.isArray(dataAreas) ? dataAreas : []);
    } catch (error) {
      console.error("Error al cargar la estructura de datos:", error);
    }
  };

  useEffect(() => {
    const inicializarModulo = async () => {
      await cargarDatosSistematicos();
    };
    inicializarModulo();
  }, []);

  const handleCrearArea = async (e) => {
    e.preventDefault();
    if(!nuevaArea.trim()) return;
    const res = await fetch("http://localhost:3000/api/areas-it", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevaArea })
    });
    const data = await res.json();
    if (data.ok) {
      alert(data.message);
      setNuevaArea('');
      cargarDatosSistematicos();
    }
  };

  const handleEliminarArea = async (id) => {
    if(window.confirm("¿Deseas remover esta área de especialidad IT?")) {
      await fetch(`http://localhost:3000/api/areas-it/${id}`, { method: "DELETE" });
      cargarDatosSistematicos();
    }
  };

  const handleCreateUsuario = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUsuario)
    });
    const data = await res.json();
    if(data.ok) {
      alert(data.message);
      setNuevoUsuario({ name: '', email: '', password: '', role: 'ADMIN', area: '' });
      cargarDatosSistematicos();
    }
  };

  const handleCambiarRol = async (id, usuario) => {
    const nuevoRol = usuario.role === 'ADMIN' ? 'USER' : 'ADMIN';
    await fetch(`http://localhost:3000/api/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...usuario, role: nuevoRol })
    });
    cargarDatosSistematicos();
  };

  const handleEliminarUsuario = async (id) => {
    if(window.confirm("¿Seguro que deseas dar de baja este acceso del sistema?")) {
      await fetch(`http://localhost:3000/api/usuarios/${id}`, { method: "DELETE" });
      cargarDatosSistematicos();
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f8", fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* 1. SE INTEGRA LA BARRA LATERAL FIJA */}
      <Sidebar />

      {/* 2. CONTENEDOR FLUIDO DE CONTENIDO */}
      <div style={{ flex: 1, overflowY: "auto", padding: '30px' }}>
        
        <h2 style={{ borderBottom: '2px solid #e67e22', paddingBottom: '8px', marginTop: 0, color: '#1e293b' }}>
          🛠️ Panel de Control Estructural - IT
        </h2>
        
        {/* SECCIÓN GESTIÓN DE ÁREAS IT */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0, color: '#e67e22', fontSize: '16px' }}>🏢 Áreas de Especialidad Soporte</h3>
          
          <form onSubmit={handleCrearArea} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="text" placeholder="Ej. Soporte Técnico, Desarrollo Web, Infraestructura..." required
              value={nuevaArea} onChange={e => setNuevaArea(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '10px 20px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              + Registrar Nueva Área
            </button>
          </form>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {areas.map(a => (
              <span key={a.id} style={{ background: '#f8fafc', padding: '6px 14px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <strong>{a.nombre}</strong>
                <button type="button" onClick={() => handleEliminarArea(a.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* SECCIÓN REGISTRO DE ASESORES */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0, color: '#e67e22', fontSize: '16px' }}>👤 Registrar Asesores y Personal</h3>
          
          <form onSubmit={handleCreateUsuario} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <input type="text" placeholder="Nombre del Asesor" required value={nuevoUsuario.name} onChange={e => setNuevoUsuario({...nuevoUsuario, name: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}/>
            <input type="email" placeholder="correo@baprosa.com" required value={nuevoUsuario.email} onChange={e => setNuevoUsuario({...nuevoUsuario, email: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}/>
            <input type="password" placeholder="Contraseña de acceso" value={nuevoUsuario.password} onChange={e => setNuevoUsuario({...nuevoUsuario, password: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}/>
            
            <select value={nuevoUsuario.area} onChange={e => setNuevoUsuario({...nuevoUsuario, area: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none' }}>
              <option value="">Asignar Área IT...</option>
              {areas.map(a => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
            </select>

            <select value={nuevoUsuario.role} onChange={e => setNuevoUsuario({...nuevoUsuario, role: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none' }}>
              <option value="ADMIN">ADMIN (Asesor Técnico)</option>
              <option value="USER">USER (Empleado General)</option>
            </select>

            <button type="submit" style={{ padding: '10px', background: '#ff7f22', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              Guardar Colaborador
            </button>
          </form>
        </div>

        {/* TABLA DE USUARIOS */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#2c3e50', color: 'white', textAlign: 'left' }}>
                <th style={{ padding: '14px', fontSize: '14px' }}>Nombre Completo</th>
                <th style={{ padding: '14px', fontSize: '14px' }}>Cuenta de Outlook</th>
                <th style={{ padding: '14px', fontSize: '14px' }}>Permisos del Sistema</th>
                <th style={{ padding: '14px', fontSize: '14px' }}>Gestión Operativa</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '14px', fontSize: '13px', color: '#334155', fontWeight: '500' }}>{u.name}</td>
                  <td style={{ padding: '14px', fontSize: '13px', color: '#64748b' }}>{u.email}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 10px', background: u.role === 'ADMIN' ? '#eaf2f8' : '#f1f5f9', color: u.role === 'ADMIN' ? '#2980b9' : '#64748b', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <button type="button" onClick={() => handleCambiarRol(u.id, u)} style={{ marginRight: '8px', padding: '6px 12px', background: '#34495e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Cambiar Rol</button>
                    <button type="button" onClick={() => handleEliminarUsuario(u.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Dar de Baja</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}