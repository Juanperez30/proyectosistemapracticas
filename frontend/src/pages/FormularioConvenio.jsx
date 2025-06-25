import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Button, List, ListItem, ListItemText, Box, TextField} from '@mui/material';


const nombresDocumentos = [
    "certificado_existencia",
    "rut",
    "id_representante",
    "antecedentes_disciplinarios_entidad",
    "antecedentes_disciplinarios_representante",
    "antecedentes_fiscales_entidad",
    "antecedentes_fiscales_representante",
    "antecedentes_judiciales_representante",
    "rnmc",
    "redam"
];

const nombresBonitos = {
  certificado_existencia: 'Certificado de existencia',
  rut: 'RUT',
  id_representante: 'Documento del Representante Legal',
  antecedentes_entidad: 'Antecedentes disciplinarios de la entidad',
  antecedentes_rep_legal: 'Antecedentes disciplinarios del representante',
  fiscales_entidad: 'Antecedentes fiscales de la entidad',
  fiscales_rep_legal: 'Antecedentes fiscales del representante',
  antecedentes_judiciales: 'Antecedentes judiciales del representante',
  rnmc: 'Medidas correctivas del representante',
  redam: 'Certificado REDAM',
};

const SubirConvenio = () => {
  const [documentos, setDocumentos] = useState({});
  const [guardado, setGuardado] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [convenioData, setConvenioData] = useState({});
  const [motivoRechazo, setMotivoRechazo] = useState('');


    const descargarArchivo = async (campo) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/convenio/archivo-propio/${campo}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // muy importante para archivos
        });

        // Crear URL temporal para descargar el blob
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${campo}.pdf`); // nombre de archivo para descarga
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al descargar archivo:', error);
    }
    };


    const fetchConvenio = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/convenio/estado', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConvenioData(response.data);
      } catch (err) {
        setError('Error al cargar convenio');
      } finally {
        setLoading(false);
      }
    };

  const cargarConvenio = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/convenio/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setDocumentos(res.data);
        setMotivoRechazo(documentos.motivo_rechazo)
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarConvenio();
    fetchConvenio();
  }, []);

  const handleArchivo = (e, campo) => {
    setDocumentos((prev) => ({
      ...prev,
      [campo]: e.target.files[0],
    }));
  };

  const guardarParcial = async () => {
  try {
    const token = localStorage.getItem('token');

    for (const campo of nombresDocumentos) {
      const archivo = documentos[campo];

      if (archivo instanceof File) {
        const formData = new FormData();
        formData.append('tipo', campo);
        formData.append('archivo', archivo);

        await axios.post('http://localhost:8000/api/convenio/subir/', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }
    }

    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  } catch (err) {
    console.error(err);
    setError('Error al guardar documentos.');
  }
};

  const enviarParaRevision = async () => {
    const incompletos = nombresDocumentos.some((campo) => !documentos[campo]);
    if (incompletos) {
      setError('Todos los documentos deben estar presentes para enviar.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/convenio/enviar/',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEnviado(true);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al enviar convenio.');
    }
  };
  console.log(documentos.motivo_rechazo);

  return (
  <div>
    <h2>Documentos para Convenio</h2>

    {error && <p style={{ color: 'red' }}>{error}</p>}
    {guardado && <p style={{ color: 'green' }}>Guardado correctamente.</p>}
    {enviado && <p style={{ color: 'blue' }}>Convenio enviado para revisión.</p>}

    {convenioData.estado === 'rechazado' && documentos.motivo_rechazo && (
      <Box mt={2} p={2} bgcolor="#ffe6e6" borderRadius={2}>
        <Typography color="error" variant="h6">Convenio Rechazado</Typography>
        <Typography variant="body1">{documentos.motivo_rechazo}</Typography>
      </Box>
    )}

    <form>
      {nombresDocumentos.map((campo) => (
        <div key={campo} style={{ marginBottom: '1rem' }}>
          <label>{nombresBonitos[campo]}</label><br />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleArchivo(e, campo)}
            disabled={convenioData.estado === 'enviado'}
          />
          {typeof documentos[campo] === 'string' && (
            <button
              type="button"
              style={{ marginLeft: '10px' }}
              onClick={() => descargarArchivo(campo)}
            >
              Ver actual
            </button>
          )}
        </div>
      ))}
    </form>

    {convenioData.estado === 'enviado' ? (
      <p style={{ color: 'blue', fontWeight: 'bold', marginTop: '1rem' }}>
        Los documentos están siendo revisados, no puede realizar cambios.
      </p>
    ) : (
      <>
        <button onClick={guardarParcial} disabled={guardado || enviado}>
          Guardar Cambios
        </button>
        <button onClick={enviarParaRevision} disabled={enviado || guardado}>
          Enviar para Revisión
        </button>
      </>
    )}
  </div>
);
};

export default SubirConvenio;
