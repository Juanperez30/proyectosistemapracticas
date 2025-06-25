import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, Button, List, ListItem, ListItemText, Paper } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DashboardEstudiante = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {

      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const estudianteId = decodedToken.usuario_id;

        const responsePerfil = await axios.get(`http://localhost:8000/api/estudiantes/${estudianteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPerfil(responsePerfil.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (token) {
      fetchPerfil();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleInscribirse = () => {
    navigate('/inscripcion-practica');
  };

  const handleListarEmpresas = () => {
    navigate('/estudiante/listar-empresas');
  };

  const handleEstudiantesEnPractica = () => {
    navigate('/estudiante/estudiantes-en-practica');
  };

  const handleIrAVerificar = () => {
    navigate('/estudiante/verificar-cuenta');
  };

  const verificado = perfil?.verificado;


  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Dashboard Estudiante
        </Typography>
        {perfil ? (
          <Paper sx={{ padding: 3 }}>
            <Typography variant="h6">Tu Perfil</Typography>
            <List>
              <ListItem>
                <ListItemText primary="Nombre" secondary={perfil.nombre} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Correo" secondary={perfil.correo} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Estado de verificación"
                  secondary={verificado ? 'Verificado' : 'No verificado'}
                />
              </ListItem>
            </List>

            {!verificado && (
              <Button
                variant="contained"
                color="warning"
                onClick={handleIrAVerificar}
                sx={{ mt: 2 }}
              >
                Ingresar código de verificación
              </Button>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleInscribirse}
              sx={{ mt: 2 }}
              disabled={!verificado}
            >
              Inscribirse a Prácticas
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleListarEmpresas}
              sx={{ mt: 2, ml: 2 }}
              disabled={!verificado}
            >
              Ver convenios disponibles
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEstudiantesEnPractica}
              sx={{ mt: 2, ml: 2 }}
              disabled={!verificado}
            >
              Consultar estudiantes en práctica
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              sx={{ mt: 2, ml: 2 }}
            >
              Cerrar sesión
            </Button>
          </Paper>
        ) : (
          <Typography>Cargando perfil...</Typography>
        )}
      </Box>
    </Container>
  );
};

export default DashboardEstudiante;
