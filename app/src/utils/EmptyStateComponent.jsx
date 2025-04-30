import React from 'react';
import './EmptyStateComponent.css';

const EmptyStateComponent = ({ message = 'Nenhum dado encontrado' }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <i className="bi bi-emoji-frown"></i>
      </div>
      <h3>{message}</h3>
      <p>Tente novamente mais tarde ou entre em contato com o suporte.</p>
    </div>
  );
};

export default EmptyStateComponent; 