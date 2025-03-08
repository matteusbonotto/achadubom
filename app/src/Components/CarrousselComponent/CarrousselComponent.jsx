import './CarrousselComponent.css';
import './CarrousselComponent.css';
import { Card } from 'primereact/card';

const CarrousselComponent = ({ images }) => {
  return (
    <div className="carousel">
      <Card title="Bem vindo a AchaduBom">
      <p className="m-0">
        Achadinhos BBB, Bom Bonito e Barato!!!
      </p>
    </Card>
    </div>
  );
};

export default CarrousselComponent;