import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleVerPracticas = () => {
    navigate('/aprobar-practicas');
  };
  const handleVerConvenios = () => {
    navigate('/admin/lista-convenios');
  };
  const handleListarEmpresas = () => {
    navigate('/admin/listar-empresas');
  };
  const handleListarEstudiantes = () => {
    navigate('/admin/listar-estudiantes');
  };
  
  return (
    <div className="container mt-4">
      <h2>Dashboard de Administrador</h2>
      <p>Bienvenido. Desde aquí puedes aprobar prácticas universitarias.</p>
      <Button className="btn btn-primary mt-3" onClick={handleVerPracticas}>
        Ver y aprobar prácticas
      </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleVerConvenios}
        >
          Revisar Convenios pendientes
        </Button>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleListarEmpresas}
        >
          Revisar con convenios
        </Button>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleListarEstudiantes}
        >
          Listar los estudiantes inscritos
        </Button>
       <button onClick={() => navigate('/admin/postulaciones')}>
        Gestionar Postulaciones de Prácticas
      </button>
    </div>
  );
};

export default AdminDashboard;
