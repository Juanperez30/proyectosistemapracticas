import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPostulaciones = () => {
  const [practicas, setPracticas] = useState([]);
  const [error, setError] = useState(null);

  const fetchPracticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/practicas-con-postulaciones/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPracticas(res.data);

      console.log(res.data);
    } catch (err) {
      setError('Error cargando prácticas');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPracticas();
  }, []);

  const aceptarPostulacion = async (postulacionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/postulaciones/${postulacionId}/estado/`,
         { estado: 'aceptado' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchPracticas();
    } catch (err) {
      console.error(err);
      setError('Error al aceptar postulación');
    }
  };

  const rechazarPostulacion = async (postulacionId) => {    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
          `http://localhost:8000/api/postulaciones/${postulacionId}/estado/`,
          { estado: 'rechazado' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );      
      await fetchPracticas();
    } catch (err) {
      console.error(err);
      setError('Error al rechazar postulación');
    }
  };

    const generarActa = async (postulacionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/acta/${postulacionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob', // importante para archivos
        }
      );

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Acta_Practica.docx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generando acta:', err);
      alert('Error al generar el acta de práctica');
    }
  };
  const descargarHojaDeVida = async (nombreArchivo) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/admin/hoja-de-vida/${nombreArchivo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error descargando hoja de vida:', err);
      alert('No se pudo descargar el archivo');
    }
  };
  return (
    <div>
      <h2>Gestión de Postulaciones (Administrador)</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {practicas.map((practica) => {
        const aprobados = practica.postulaciones.filter(p => p.estado === 'aceptado').length;
        const limiteAlcanzado = aprobados >= practica.limite_estudiantes;

        return (
          <div key={practica.id} style={{ marginBottom: '3rem' }}>
            <h3>{practica.nombre} - {practica.empresa?.nombre || 'Empresa desconocida'}</h3>
            <p>Límite de estudiantes: {practica.limite_estudiantes} | Aprobados: {aprobados}</p>
            {limiteAlcanzado && (
              <p style={{ color: 'green' }}>
                Límite alcanzado. No se pueden aceptar más estudiantes.
              </p>
            )}
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Correo</th>
                  <th>Hoja de vida</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {practica.postulaciones.map((p) => (
                  <tr key={p.id}>
                    <td>{p.estudiante?.nombre || 'Desconocido'}</td>
                    <td>{p.estudiante?.correo || 'Desconocido'}</td>
                    <td>
                      {p.hoja_de_vida ? (
                        <button onClick={() => descargarHojaDeVida(p.hoja_de_vida)}>
                          Descargar
                        </button>
                      ) : 'No disponible'}
                    </td>
                    <td>{p.estado}</td>
                    <td>
                      {p.estado === 'En proceso' && !limiteAlcanzado && (
                        <>

                          <button onClick={() => aceptarPostulacion(p.id)}>Aceptar</button>{' '}
                          <button onClick={() => rechazarPostulacion(p.id)}>Rechazar</button>

                        </>
                      )}
                       {p.estado === 'aceptado' && limiteAlcanzado && (
                         
                         <button onClick={() => generarActa(p.id)}>Generar Acta</button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default AdminPostulaciones;
