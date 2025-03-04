import React, { useState } from 'react';
import './AccordionComponent.css';
import Carroussel from '../CarrousselComponent/CarrousselComponent';

const AccordionComponent = ({ title, content, carouselImages }) => {
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
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        <p>{content}</p>
        <img src="{carouselImages}" alt="" />
          <Carroussel images={carouselImages} />
      </div>
    </div>
  );
};

export default AccordionComponent;