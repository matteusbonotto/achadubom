import "./CarrousselComponent.css";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import GalleriaComponent from "../GalleriaComponent/GalleriaComponent";

const CarrousselComponent = ({ images }) => {
  return (
    <div className="carousel">
      <Card title="Bem vindo a AchaduBom">
        <p className="m-0 p">Achadinhos BBB, Bom Bonito e Barato!!!</p>
        {/* <p className="m-0 p">Se precisar pode acessar a shopee por aqui!</p>
        <Button
          className="p-button-rounded"
          onClick={() =>
            window.open("https://s.shopee.com.br/3q8rMqkIcx", "_blank")
          }
        > Shoppe
        </Button> */}
      </Card>
      {/* <GalleriaComponent/> */}
    </div>
  );
};

export default CarrousselComponent;
