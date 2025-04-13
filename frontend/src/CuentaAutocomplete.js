import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CuentaAutocomplete.css';
function CuentaAutocomplete({ onSelectCuenta }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  useEffect(() => {
    if (query.trim() === '') {
      setResultados([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      axios
        .get(`http://localhost:5000/buscar-cuenta?q=${query}`)
        .then(res => setResultados(res.data))
        .catch(err => console.error(err));
    }, 300); // Espera 300ms después de dejar de escribir

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (cuenta) => {
    setQuery(`${cuenta.codigo} - ${cuenta.descripcion}`);
    setMostrarSugerencias(false);
    onSelectCuenta(cuenta); // puedes usar esto para pasarlo al padre
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        className="input-cuenta"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setMostrarSugerencias(true);
        }}
        placeholder="Buscar cuenta contable..."
        autoComplete="off"
      />

      {mostrarSugerencias && resultados.length > 0 && (
        <ul style={{
          position: 'absolute',
          background: 'white',
          border: '1px solid #ccc',
          width: '100%',
          zIndex: 10,
          listStyle: 'none',
          padding: 0,
          margin: 0,
          maxHeight: '150px',
          overflowY: 'auto'
        }}>
          {resultados.map((cuenta) => (
            <li
              key={cuenta.codigo}
              onClick={() => handleSelect(cuenta)}
              style={{ padding: '8px', cursor: 'pointer' }}
            >
              {cuenta.codigo} - {cuenta.descripcion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CuentaAutocomplete;
