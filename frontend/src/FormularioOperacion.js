import React, { useState } from 'react';
import axios from 'axios';
import './FormularioOperaciones.css';
import CuentaAutocomplete from './CuentaAutocomplete';

const FormularioOperaciones = ({ onOperacionSubmit }) => {
  const [tipo, setTipo] = useState('');
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState('');
  const [movimientos, setMovimientos] = useState([]);
  const [error, setError] = useState('');
  const [ultimaOperacion, setUltimaOperacion] = useState(null); // NUEVO
  const [inventarioFinal, setInventarioFinal] = useState('');
  const [inventarioInicial, setInventarioInicial] = useState(0); // desde el backend

  // Obtener saldo actual de la cuenta 20 (Inventario Inicial)
  useEffect(() => {
    axios.get('https://sistema-contable-cqg4.onrender.com/api/reporte-saldos')
      .then(response => {
        const saldos = response.data.reporte_saldos;
        const saldoInventario = saldos['20']?.saldo || 0;
        setInventarioInicial(saldoInventario);
      })
      .catch(error => {
        console.error("Error al obtener el saldo de la cuenta 20:", error);
      });
  }, [ultimaOperacion]); // se actualiza cuando se registra una nueva operación




  const agregarMovimiento = () => {
    if (!tipo || !cuentaSeleccionada || !monto) {
      setError("Completa todos los campos antes de agregar el movimiento.");
      return;
    }

    const nuevoMovimiento = {
      tipo,
      codigo: parseInt(cuentaSeleccionada.codigo),
      descripcion: cuentaSeleccionada.descripcion,
      monto: parseFloat(monto)
    };

    setMovimientos([...movimientos, nuevoMovimiento]);
    setTipo('');
    setCuentaSeleccionada(null);
    setMonto('');
    setError('');
  };

  const registrarOperacion = async () => {
    const hayDebe = movimientos.some(m => m.tipo === 'D');
    const hayHaber = movimientos.some(m => m.tipo === 'H');
    const totalDebe = movimientos.filter(m => m.tipo === 'D').reduce((acc, m) => acc + m.monto, 0);
    const totalHaber = movimientos.filter(m => m.tipo === 'H').reduce((acc, m) => acc + m.monto, 0);
  
    if (!hayDebe || !hayHaber) {
      setError("Debe haber al menos un movimiento en el DEBE y uno en el HABER.");
      return;
    }

    if (totalDebe !== totalHaber) {
      setError("La suma de los DEBE y HABER no es igual. No se puede registrar la operación.");
      setMovimientos([]);  // Limpiar los movimientos
      return;  // No continuar con el registro
    }

    if (!fecha) {
      setError("Selecciona una fecha para la operación.");
      return;
    }

    try {
      const operacion = { fecha, movimientos };
      await axios.post('https://sistema-contable-cqg4.onrender.com/api/operaciones', operacion);

      setUltimaOperacion(operacion); // GUARDAMOS PARA MOSTRAR EL RESUMEN

      // Limpiar campos
      setMovimientos([]);
      setTipo('');
      setCuentaSeleccionada(null);
      setMonto('');
      setFecha('');
      setError('');

      const response = await axios.get('https://sistema-contable-cqg4.onrender.com/api/operaciones');
      onOperacionSubmit(response.data);
    } catch (error) {
      setError("Registrado");
    }
  };

  // Función para borrar la última operación
  const borrarUltimaOperacion = async () => {
    try {
      const response = await axios.delete('https://sistema-contable-cqg4.onrender.com/api/operaciones/limpiar-ultima');
      setUltimaOperacion(null);  // Limpiar el resumen
      onOperacionSubmit(response.data);  // Actualizar la lista de operaciones
    } catch (error) {
      setError("Registrado.");
    }
  };

  // Función para borrar todas las operaciones
  const borrarTodasOperaciones = async () => {
    try {
      const response = await axios.delete('https://sistema-contable-cqg4.onrender.com/api/operaciones/limpiar-todo');
      setUltimaOperacion(null);  // Limpiar el resumen
      setMovimientos([]);  // Limpiar los movimientos actuales
      onOperacionSubmit(response.data);  // Actualizar la lista de operaciones
    } catch (error) {
      setError("Error al borrar todas las operaciones.");
    }
  };

  return (
    
    <div className="form-container">
      <h2>Registrar Operación Contable</h2>
      {error && <p className="error-message">{error}</p>}

      <div>
        <label>Fecha:</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      <div className="button-container">
        <button
          type="button"
          className={`button-debe ${tipo === 'D' ? 'selected' : ''}`}
          onClick={() => setTipo('D')}
        >
          DEBE
        </button>
        <button
          type="button"
          className={`button-haber ${tipo === 'H' ? 'selected' : ''}`}
          onClick={() => setTipo('H')}
        >
          HABER
        </button>
      </div>

      <div>
        <label>Buscar Cuenta:</label>
        <CuentaAutocomplete onSelectCuenta={setCuentaSeleccionada} />
        {cuentaSeleccionada && (
          <p className="cuenta-seleccionada">
            Cuenta Seleccionada: {cuentaSeleccionada.codigo} - {cuentaSeleccionada.descripcion}
          </p>
        )}
      </div>

      <div>
        <label>Monto:</label>
        <input
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
      </div>

      <button type="button" onClick={agregarMovimiento} className="submit-button">
        Agregar Movimiento
      </button>
      <button type="button" onClick={registrarOperacion} className="submit-button">
        Registrar Operación
      </button>

      <h3>Movimientos actuales:</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px' }}>Cuenta</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Debe</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Haber</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((mov, index) => (
            <tr key={index}>
              <td style={{ padding: '8px' }}>{mov.codigo} - {mov.descripcion}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>
                {mov.tipo === 'D' ? mov.monto.toFixed(2) : ''}
              </td>
              <td style={{ padding: '8px', textAlign: 'right' }}>
                {mov.tipo === 'H' ? mov.monto.toFixed(2) : ''}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Totales</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                {movimientos.filter(m => m.tipo === 'D').reduce((acc, m) => acc + m.monto, 0).toFixed(2)}
              </td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                {movimientos.filter(m => m.tipo === 'H').reduce((acc, m) => acc + m.monto, 0).toFixed(2)}
              </td>
            </tr>
        </tfoot>
      </table>

      {/* Cálculo de Costo de Venta */}
      <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
        <h3>Cálculo del Costo de Venta</h3>
        <div style={{ marginBottom: '10px' }}>
          <label><strong>Inventario Final (físico):</strong></label>
          <input
            type="number"
            value={inventarioFinal}
            onChange={(e) => setInventarioFinal(e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </div>
        <div style={{ backgroundColor: '#f2f2f2', padding: '10px', borderRadius: '5px' }}>
          <p><strong>Inventario Inicial (Cuenta 20):</strong> {inventarioInicial.toFixed(2)}</p>
          <p><strong>Inventario Final:</strong> {inventarioFinalFloat.toFixed(2)}</p>
          <p><strong>Costo de Venta:</strong> {costoVenta.toFixed(2)}</p>
        </div>
      </div>


      {/* RESUMEN FINAL DE LA OPERACIÓN RECIÉN REGISTRADA */}
      {ultimaOperacion && (
        <div className="resumen-operacion" style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
          <h3>Resumen de la última operación registrada</h3>
          <p><strong>Fecha:</strong> {ultimaOperacion.fecha}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px' }}>Cuenta</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>Debe</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>Haber</th>
              </tr>
            </thead>
            <tbody>
              {ultimaOperacion.movimientos.map((mov, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px' }}>{mov.codigo} - {mov.descripcion}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    {mov.tipo === 'D' ? mov.monto.toFixed(2) : ''}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    {mov.tipo === 'H' ? mov.monto.toFixed(2) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botones de limpieza */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={borrarUltimaOperacion} className="submit-button" style={{ marginRight: '10px' }}>
          Borrar Última Operación
        </button>
        <button onClick={borrarTodasOperaciones} className="submit-button">
          Borrar Todas las Operaciones
        </button>
      </div>
    </div>
  );
};

export default FormularioOperaciones;
