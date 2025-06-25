import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EstudiantesEnPractica = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/estudiantes-en-practica', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEstudiantes(res.data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los estudiantes en práctica.');
      }
    };

    fetchEstudiantes();
  }, []);

  const renderTabla = (lista, titulo) => (
    <>
      <h3>{titulo}</h3>
      {lista.length === 0 ? (
        <p>No hay estudiantes en esta categoría.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Carrera</th>
              <th>Empresa</th>
              <th>Práctica</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((e, index) => (
              <tr key={index}>
                <td>{e.nombre_estudiante}</td>
                <td>{e.correo_estudiante}</td>
                <td>{e.carrera}</td>
                <td>{e.empresa}</td>
                <td>{e.nombre_practica}</td>
                <td>{e.fecha_inicio}</td>
                <td>{e.fecha_fin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );

  const enCurso = estudiantes.filter(e => e.estado === 'en curso');
  const finalizadas = estudiantes.filter(e => e.estado === 'finalizada');

  return (
    <div>
      <h2>Estudiantes en Prácticas</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {renderTabla(enCurso, 'Prácticas en Curso')}
      <hr />
      {renderTabla(finalizadas, 'Prácticas Finalizadas')}
    </div>
  );
};

export default EstudiantesEnPractica;
