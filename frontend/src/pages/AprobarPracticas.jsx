import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AprobarPracticas = () => {
  const [practicas, setPracticas] = useState([]);
  const [error, setError] = useState(null);

  const fetchPracticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/practicas/pendientes/', {
        headers: { Authorization: `Bearer ${token}` 
         }
      });
      setPracticas(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las prácticas.');
    }
  };

  const aprobarPractica = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/practicas/${id}/aprobar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPracticas(practicas.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      setError('No se pudo aprobar la práctica.');
    }
  };

  useEffect(() => {
    fetchPracticas();
  }, []);

  return (
    <div>
      <h2>Prácticas pendientes de aprobación</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {practicas.length === 0 ? (
        <p>No hay prácticas pendientes.</p>
      ) : (
        <ul>
          {practicas.map((practica) => (
            <li key={practica.id}>
              <strong>{practica.nombre}</strong> - {practica.descripcion}
              <button onClick={() => aprobarPractica(practica.id)}>Aprobar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AprobarPracticas;
