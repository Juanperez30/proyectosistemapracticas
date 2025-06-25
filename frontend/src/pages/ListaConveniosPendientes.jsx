import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ListaConveniosPendientes = () => {
  const [convenios, setConvenios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConvenios = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/admin/convenios-pendientes/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConvenios(res.data);
      } catch (err) {
        console.error('Error al cargar convenios pendientes', err);
      }
    };

    fetchConvenios();
  }, []);

  const handleRevisar = (empresa_id) => {
    navigate(`/admin/revisar-convenio/${empresa_id}`);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Convenios pendientes de revisión</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Empresa</TableCell>
            <TableCell>Correo</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {convenios.map((c) => (
            <TableRow key={c.empresa_id}>
              <TableCell>{c.nombre_empresa}</TableCell>
              <TableCell>{c.correo_empresa}</TableCell>
              <TableCell>
                <Button variant="contained" onClick={() => handleRevisar(c.empresa_id)}>
                  Revisar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default ListaConveniosPendientes;
