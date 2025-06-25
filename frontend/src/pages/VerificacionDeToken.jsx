import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const VerificarCuenta = () => {
  const { token } = useParams();
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const verificar = async () => {
      try {
        await axios.get(`http://localhost:8000/api/verificar/${token}`);
        setMensaje('Cuenta verificada correctamente. Ya puedes iniciar sesión.');
      } catch (err) {
        setError('Token inválido o ya fue utilizado.');
      }
    };
    verificar();
  }, [token]);

  return (
    <div>
      <h2>Verificar Cuenta</h2>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default VerificarCuenta;
