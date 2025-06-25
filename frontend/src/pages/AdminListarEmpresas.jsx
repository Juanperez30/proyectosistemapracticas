import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminEmpresasConConvenio = () => {
  const [empresas, setEmpresas] = useState([]);
  const [error, setError] = useState(null);

  const fetchEmpresas = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/empresas-con-convenio', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmpresas(res.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar empresas');
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return (
    <div>
      <h2>Empresas con Convenio Aprobado</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            {/* <th>Dirección</th>
            <th>Descripción</th> */}
          </tr>
        </thead>
        <tbody>
          {empresas.map((e) => (
            <tr key={e.id}>
              <td>{e.nombre}</td>
              <td>{e.correo}</td>
              {/* <td>{e.telefono}</td>
              <td>{e.direccion}</td>
              <td>{e.descripcion}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminEmpresasConConvenio;
