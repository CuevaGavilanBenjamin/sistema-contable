import React from 'react';
import { Link } from 'react-router-dom';

const FirstPage = () => {
  return (
    <div>
      <h1>Bienvenido a la página de operaciones</h1>
      {/* Redirige al reporte usando Link */}
      <Link to="/reporte">
        <button>Ver Reporte</button>
      </Link>
    </div>
  );
};

export default FirstPage;
