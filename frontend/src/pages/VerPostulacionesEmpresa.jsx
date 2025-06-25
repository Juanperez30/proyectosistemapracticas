import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VerPostulacionesEmpresa = () => {
  const [agrupadas, setAgrupadas] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostulaciones = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/postulaciones-empresa', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const aceptadas = response.data.filter(p => p.estado === 'aceptado');
        const agrupadasPorPractica = {};

        aceptadas.forEach((p) => {
          if (!agrupadasPorPractica[p.practica_nombre]) {
            agrupadasPorPractica[p.practica_nombre] = [];
          }
          agrupadasPorPractica[p.practica_nombre].push(p);
        });

        setAgrupadas(agrupadasPorPractica);
      } catch (err) {
        console.error(err);
        setError('Error al cargar postulaciones');
      }
    };

    fetchPostulaciones();
  }, []);

  return (
    <div>
      <h2>Estudiantes Aceptados por Práctica</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {Object.entries(agrupadas).map(([nombrePractica, postulaciones]) => (
        <div key={nombrePractica} style={{ marginBottom: '2rem' }}>
          <h3>{nombrePractica}</h3>
          <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Correo</th>
                <th>Hoja de Vida</th>
              </tr>
            </thead>
            <tbody>
              {postulaciones.map((p, index) => (
                <tr key={p.id || `${p.estudiante_correo}-${index}`}>
                  <td>{p.estudiante_nombre || 'Desconocido'}</td>
                  <td>{p.estudiante_correo || 'Desconocido'}</td>
                  <td>
                    {p.hoja_de_vida ? (
                      <a
                        href={`http://localhost:8000/api/hoja-de-vida/${p.hoja_de_vida}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Descargar
                      </a>
                    ) : (
                      'No disponible'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default VerPostulacionesEmpresa;
