import React from 'react';
import './Banner.css';
import banner from '../../assets/images/banners/banner-social.png';

function Banner() {
  return (
    <div className="section banner">
      <img src={banner} alt="Banner" />
      <div className="texto-sobreposto">
        <h1>Curte, segue e compartilha!!!</h1>
        <p>Nos acompanhe e descubra ofertas incríveis e produtos são virais!</p>
        <div className="header-links">
          <a href="https://www.instagram.com/lojaachadubom/" target="_blank"><i className="bi bi-instagram"></i></a>
          <a href="https://www.tiktok.com/@achadubom" target="_blank"><i className="bi bi-tiktok"></i></a>
          <a href="https://www.youtube.com/@AchaduBom" target="_blank"><i className="bi bi-youtube"></i></a>
          <a href="https://www.facebook.com/profile.php?id=61574773212871" target="_blank"><i className="bi bi-facebook"></i></a>
        </div>
      </div>
    </div>
  );
}

export default Banner; 