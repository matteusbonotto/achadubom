import './CarrousselComponent.css';
import { Card } from 'primereact/card';
import GalleriaComponent from '../GalleriaComponent/GalleriaComponent';

const CarrousselComponent = ({ images }) => {
  return (
    <div className="carousel">
      <Card title="Bem vindo a AchaduBom">
      <p className="m-0 p">
        Achadinhos BBB, Bom Bonito e Barato!!!
      </p>
    </Card>
    {/* <GalleriaComponent/> */}
    </div>
  );
};

export default CarrousselComponent;