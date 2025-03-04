import React from 'react';
import './HomePage.css';
import AccordionComponent from '../../Components/AccordionComponent/AccordionComponent';

const Home = () => {
  console.log('Home component rendered');

  return (
    <div className="container mx-auto p-4">
      <h3 className="text-center my-4 flex items-center justify-center">
        <i
          className="fas fa-chevron-left mr-3 cursor-pointer"
          onClick={() => window.history.back()}
          title="Voltar"
        ></i>
        Bem vindo a Achadu bom
      </h3>
      <AccordionComponent title="O que é o Achadu bom?" content="O Achadu bom é um site de busca de achados e perdidos." />
      <AccordionComponent title="Como funciona?" content="Você pode buscar por itens perdidos e também cadastrar itens achados." />
    </div>
  );
};

export default Home;