import React from "react";
import "./FooterComponent.css";
import logo from "../../Assets/images/logo.png";
import { Button } from "primereact/button";

const FooterComponent = () => {
  return (
    <div>
      <footer className="footer text-center">
        <img src={logo} alt="" />
        <h1>Curte, segue e compartilha para mais</h1>
        <div>
          <Button
            icon="pi pi-tiktok"
            className="p-button-rounded tiktok"
            onClick={() =>
              window.open("https://tinyurl.com/" + "product.code", "_blank")
            }
          ></Button>
          <Button
            icon="pi pi-instagram"
            className="p-button-rounded instagram"
            onClick={() =>
              window.open("https://tinyurl.com/" + "product.code", "_blank")
            }
          ></Button>
          <Button
            icon="pi pi-shopping-bag"
            className="p-button-rounded shopee"
            onClick={() =>
              window.open("https://tinyurl.com/" + "product.code", "_blank")
            }
          ></Button>
        </div>
      </footer>
      <div className="copyright">
        <p>Desenvolvido por Matheus Bonotto © 2025 AchaduBom</p>
      </div>
    </div>
  );
};

export default FooterComponent;
