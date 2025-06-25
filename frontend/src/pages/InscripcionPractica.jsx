import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InscripcionPractica = () => {
  const [practicas, setPracticas] = useState([]);
  const [selectedPractica, setSelectedPractica] = useState('');
  const [hojaDeVida, setHojaDeVida] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [postuladas, setPostuladas] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const esFechaCierrePasada = (fechaCierre) => {
    const hoy = new Date();
    return new Date(fechaCierre) < hoy;
  };

  useEffect(() => {

    const fetchPostulaciones = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/mis-postulaciones', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const ids = response.data.map((post) => post.id_practica);
        setPostulaciones(ids);
      } catch (err) {
        console.error('Error al obtener postulaciones:', err);
      }
    };
  
    fetchPostulaciones();


    const fetchPracticas = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/practicas-aprobadas/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setPracticas(response.data);
      } catch (err) {
        console.error('Error al obtener las prácticas:', err);
        setError('No se pudieron cargar las prácticas.');
      }
    };

    fetchPracticas();
  }, []);

  const handlePostulacion = async (e, practicaId) => {
    e.preventDefault();
  
    if (!hojaDeVida) {
      setError("Debes adjuntar la hoja de vida.");
      return;
    }
  
    const formData = new FormData();
    formData.append("id_practica", practicaId);
    formData.append("archivo", hojaDeVida);
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8000/api/postular/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 200) {
        setPostuladas((prev) => [...prev, practicaId]);
        setHojaDeVida(null); // limpiar archivo cargado
      }
    } catch (err) {
      console.error("Error al postularse:", err);
      setError("Error al enviar la postulación.");
    }
  };
  

    return (
        <div>
          <h1>Inscripción a Prácticas</h1>
      
          {error && <p style={{ color: 'red' }}>{error}</p>}
      
          <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Salario</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Fecha Cierre</th>
                <th>Inscribirse</th>
              </tr>
            </thead>
            <tbody>
              {practicas.map((practica) => (
                <tr key={practica.id}>
                  <td>{practica.nombre}</td>
                  <td>{practica.descripcion}</td>
                  <td>{practica.salario}</td>
                  <td>{practica.fecha_inicio}</td>
                  <td>{practica.fecha_fin}</td>
                  <td>{practica.fecha_cierre}</td>
                  <td>
                    {esFechaCierrePasada(practica.fecha_cierre) ? (
                      <span style={{ color: "gray" }}>Fecha cerrada</span>
                    ) : postulaciones.includes(practica.id) ? (
                      <span style={{ color: "green" }}>Postulado</span>
                    ) : (
                      <form onSubmit={(e) => handlePostulacion(e, practica.id)} encType="multipart/form-data">
                        <input
                          type="file"
                          onChange={(e) => setHojaDeVida(e.target.files[0])}
                          required
                        />
                        <button type="submit">Inscribirse</button>
                      </form>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      
};

export default InscripcionPractica;
