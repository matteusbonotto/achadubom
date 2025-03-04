import React, { useState } from 'react';
import './CarrousselComponent.css';
import './CarrousselComponent.css';

const CarrousselComponent = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={toggleAccordion}>
        <h3>{title}</h3>
        <span>{isOpen ? '-' : '+'}</span>
      </div>
      {isOpen && (
        <div className="accordion-content">
          <p>{content}</p>
        </div>
      )}
    </div>
  );
};

const Carroussel = ({ images }) => {
  return (
    <div className="carousel">
      {images.map((image, index) => (
        <img key={index} src={image.url} alt={image.alt} />
      ))}
    </div>
  );
};

export default CarrousselComponent;
export { Carroussel };