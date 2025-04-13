import React, { useState } from 'react';
import axios from 'axios';
import './ResumenOperaciones.css'; // Puedes personalizar este CSS

const ResumenOperaciones = ({ operacionesIniciales }) => {
  const [operaciones, setOperaciones] = useState(operacionesIniciales || []);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const actualizarResumen = async () => {
    setCargando(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/operaciones');
      setOperaciones(response.data);
    } catch (err) {
      setError("Error al actualizar las operaciones.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="resumen-operaciones-container">
      <div className="header">
        <h2>Resumen de Operaciones Contables</h2>
        <button onClick={actualizarResumen} disabled={cargando}>
          {cargando ? 'Actualizando...' : 'Actualizar Resumen'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {operaciones.length === 0 ? (
        <p>No hay operaciones registradas.</p>
      ) : (
<ul className="operaciones-lista">
  {operaciones.map((operacion, index) => (
    <li key={index} className="bloque-operacion">
      <h4>Operación {index + 1} - Fecha: {operacion.fecha || 'No disponible'}</h4>
      <table className="tabla-movimientos">
        <thead>
          <tr>
            <th>Cuenta</th>
            <th>Descripción</th>
            <th>Debe</th>
            <th>Haber</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(operacion.movimientos) && operacion.movimientos.length > 0) ? (
            operacion.movimientos.map((mov, idx) => (
              <tr key={idx}>
                <td>{mov.codigo}</td>
                <td>{mov.descripcion}</td>
                <td>{mov.tipo === 'D' ? mov.monto.toFixed(2) : ''}</td>
                <td>{mov.tipo === 'H' ? mov.monto.toFixed(2) : ''}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4">No hay movimientos para esta operación.</td></tr>
          )}
        </tbody>
      </table>
    </li>
  ))}
</ul>

      )}
    </div>
  );
};

export default ResumenOperaciones;
