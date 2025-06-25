import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, List, ListItem, ListItemText, Box, TextField} from '@mui/material';
import axios from 'axios';

const CAMPOS = [
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


const RevisarConvenio = () => {
  const { empresa_id } = useParams();
  const [documentos, setDocumentos] = useState({});
  const [motivo, setMotivo] = useState('');
  const [mostrarMotivo, setMostrarMotivo] = useState(false);
  const navigate = useNavigate();

    const rechazarConvenio = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
            'http://localhost:8000/api/admin/convenio/rechazar/',
            {
                empresa_id: parseInt(empresa_id),
                motivo: motivo,
            },
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );
            alert('Convenio rechazado');
            navigate('/admin/lista-convenios');
        } catch (err) {
            console.error(err);
            alert('Error al rechazar convenio');
        }
    };


  const handleAprobar = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8000/api/admin/convenio/aprobar/${empresa_id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Convenio aprobado');
      navigate('/admin/lista-convenios');
    } catch (err) {
      console.error('Error al aprobar convenio', err);
    }
  };

const handleDescargar = async (campo) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8000/api/admin/convenio/archivo/${empresa_id}/${campo}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('No se pudo descargar el archivo');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${campo}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error al descargar el archivo:', err);
  }
};


    return (
    <Container>
        <Typography variant="h4" gutterBottom>
        Revisión de Convenio
        </Typography>

        <List>
        {CAMPOS.map((campo) => (
            <ListItem
            key={campo}
            secondaryAction={
                <Button variant="outlined" onClick={() => handleDescargar(campo)}>
                Descargar
                </Button>
            }
            >
            <ListItemText primary={campo.replaceAll('_', ' ')} />
            </ListItem>
        ))}
        </List>

        <Box mt={2}>
        <Button variant="contained" color="success" onClick={handleAprobar}>
            Aprobar Convenio
        </Button>
        </Box>

        <Box mt={2}>
        <Button variant="contained" color="error" onClick={() => setMostrarMotivo(true)}>
            Rechazar Convenio
        </Button>
        </Box>

        {mostrarMotivo && (
        <Box mt={2}>
            <TextField
            fullWidth
            multiline
            label="Motivo del rechazo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
            />
            <Button
            color="error"
            variant="outlined"
            onClick={rechazarConvenio}
            sx={{ mt: 1 }}
            disabled={!motivo.trim()}
            >
            Confirmar Rechazo
            </Button>
        </Box>
        )}
    </Container>
    );

};

export default RevisarConvenio;
