import React, { useState, useEffect, useContext} from 'react';
import { Container, Button, Typography, Box, Badge } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';


const EmpresaDashboard = () => {
  const { token, logout } = useContext(AuthContext);
  const [postulacionesPendientes, setPostulacionesPendientes] = useState(0);
  const [convenioEnviado, setConvenioEnviado] = useState(false);
  const [convenioAprobado, setConvenioAprobado] = useState(false);
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);


  useEffect(() => {
      const fetchPerfil = async () => {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const empresa_id = decodedToken.usuario_id;

        const responsePerfil = await axios.get(`http://localhost:8000/api/empresas/${empresa_id}`, {
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
    const fetchConvenio = async () => {
      try {
        const token = localStorage.getItem('token');
        const convenioRes = await axios.get('http://localhost:8000/api/convenio/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (convenioRes.data && convenioRes.data.enviado_para_revision) {
          setConvenioEnviado(true);
        }

        const empresaRes = await axios.get('http://localhost:8000/api/empresa/verificar-convenio', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setConvenioAprobado(empresaRes.data.convenio === true);
      } catch (err) {

        console.error("Error al cargar estado del convenio", err);
      }
    };

fetchConvenio();

    const fetchPostulaciones = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/postulaciones-empresa/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
 
        const pendientes = response.data.filter(p => p.estado === 'pendiente');
        setPostulacionesPendientes(pendientes.length);
      } catch (err) {
        console.error("Error al cargar postulaciones pendientes", err);
      }
    };
 
    fetchPostulaciones();
  }, [token]);


  
  const handleRevisarPostulaciones = () => {
    navigate('/ver-postulaciones');
  };

  const handleFormularioConvenio = () => {
  navigate('/registro-convenios');
};


  const handleCrearPractica = () => {
    navigate('/crear-practica');
  };
  const verificado = perfil?.verificado;

return (
  <Container maxWidth="lg">
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>
        Bienvenido al Dashboard de Empresa
      </Typography>

      {!verificado ? (
        <Button
          variant="contained"
          color="warning"
          sx={{ mt: 2 }}
          onClick={() => navigate('/empresa/verificar-cuenta')}
        >
          Verificar Cuenta
        </Button>
      ) : (
        <>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2, mr: 2 }}
            onClick={handleRevisarPostulaciones}
            startIcon={
              <Badge badgeContent={postulacionesPendientes} color="error">
                <MailIcon />
              </Badge>
            }
          >
            Revisar Postulaciones
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={handleFormularioConvenio}
            disabled={convenioEnviado}
            sx={{ mt: 2, ml: 2 }}
          >
            Formulario de Convenio
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleCrearPractica}
            disabled={!convenioAprobado}
            sx={{ mt: 2 }}
          >
            Crear Práctica
          </Button>
        </>
      )}
    </Box>
  </Container>
);
};

export default EmpresaDashboard;
