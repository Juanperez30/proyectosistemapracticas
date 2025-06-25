import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NuevaContrasena = () => {
  const [codigo, setCodigo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const correo = localStorage.getItem('correo_recuperacion');

  useEffect(() => {
    const permitido = localStorage.getItem('codigo_validado');
    if (!permitido || permitido !== 'true') {
      navigate('/recuperar-contrasena'); // Redirige si no está validado
    }
  }, [navigate]);

  const cambiarContrasena = async () => {
    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/cambiar-contrasena/', {
        correo,
        codigo,
        nueva_contrasena: contrasena,
      });
      setMensaje('Contraseña cambiada con éxito');
      localStorage.removeItem('codigo_validado');
      localStorage.removeItem('correo_recuperacion');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cambiar contraseña');
    }
  };

  return (
    <div>
      <h2>Establecer Nueva Contraseña</h2>

      <input
        type="password"
        placeholder="Nueva contraseña"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirmar contraseña"
        value={confirmar}
        onChange={(e) => setConfirmar(e.target.value)}
      />
      <button onClick={cambiarContrasena}>Guardar contraseña</button>
      {mensaje && <p>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default NuevaContrasena;
