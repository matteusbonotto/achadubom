import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../Pages/HomePage/HomePage';
import About from '../Pages/AboutPage/AboutPage';
import Header from '../Components/HeaderComponent/HeaderComponent';
import Footer from '../Components/FooterComponent/FooterComponent';

const AppRoutes = () => {
  console.log('AppRoutes component rendered');
  return (
    <Router>  
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default AppRoutes;