import React from 'react';
import { Link } from 'react-router-dom';
import './storePage.css';
import AsideCategory from '../../components/asideCategory/asideCategory';
import Store from '../../components/store/store';

const StorePage = () => {
  return (
    <div>
      <div className="section">
        <div className="container">
          <div className="row">
            <AsideCategory />
            <Store />
          </div>
        </div>
      </div>
      <div className="text-center p-5">
        <Link to="/" className="btn btn-secondary col-4 rounded-pill">Voltar</Link>
      </div>
    </div>
  );
};

export default StorePage;