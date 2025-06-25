import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ListaEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [error, setError] = useState(null);

  const fetchEstudiantes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/estudiantes/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEstudiantes(res.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar estudiantes');
    }
  };

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  return (
    <div>
      <h2>Estudiantes Registrados</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            {/* <th>Código</th>
            <th>Teléfono</th> */}
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((e) => (
            <tr key={e.id}>
              <td>{e.nombre}</td>
              <td>{e.correo}</td>
              {/* <td>{e.codigo}</td>
              <td>{e.telefono}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaEstudiantes;
