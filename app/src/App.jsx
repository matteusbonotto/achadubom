import React from 'react';
import AccordionComponent from './Components/AccordionComponent/AccordionComponent';
import productsData from './Assets/data/products.json';
import './App.css';

const App = () => {
  return (
    <div>
      <h1>Produtos</h1>
      {productsData.map((product) => (
        <AccordionComponent
          key={product.id}
          title={product.nameProduct}
          content={product.description}
          carouselImages={product.pictures.images}
        />
      ))}
    </div>
  );
};

export default App;