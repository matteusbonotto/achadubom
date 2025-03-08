import React, { useState } from 'react';
import './AccordionComponent.css';
  
const AccordionComponent = ({ title, category, nameProduct, description, pictures, images, urLink }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={toggleAccordion}>
        <h3>{category}</h3>
        <span>{isOpen ? '-' : '+'}</span>
      </div>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        <h3>{nameProduct}</h3>
        <img src={pictures} alt="" />
        <img src={images} alt="" />
        <p>{description}</p>
        <a className='btn' href={urLink}>Eu quero</a>
      </div>
    </div>
  );
};

export default AccordionComponent;