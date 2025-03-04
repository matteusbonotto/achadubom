import React from 'react';
import './AboutPage.css';

const About = () => {
  console.log('About component rendered');

  return (
    <div className="container mx-auto p-4">
      <h3 className="text-center my-4 flex items-center justify-center">
        <i
          className="fas fa-chevron-left mr-3 cursor-pointer"
          onClick={() => window.history.back()}
          title="Voltar"
        ></i>
          AboutContent
      </h3>
    </div>
  );
};

export default About;