import React from "react";
import "./store.css";
import product01 from "../../assets/images/products/product01.png";
import product02 from "../../assets/images/products/product02.png";
import product03 from "../../assets/images/products/product03.png";
import product04 from "../../assets/images/products/product04.png";
import aliexpress from "../../assets/images/icons/aliexpress.png";
import amazon from "../../assets/images/icons/amazon.png";
import shopee from "../../assets/images/icons/shopee.png";
import mercadolivre from "../../assets/images/icons/mercadolivre.png";

// Produtos mockados
const products = [
  {
    id: 1,
    image: product01,
    store: shopee,
    category: "Eletrônicos",
    name: "Notebook",
    code: "AS4652",
  },
  {
    id: 2,
    image: product02,
    store: aliexpress,
    category: "Eletrônicos",
    name: "Headphone",
    code: "AS4653",
  },
  {
    id: 3,
    image: product03,
    store: mercadolivre,
    category: "Eletrônicos",
    name: "Smartphone",
    code: "AS4654",
  },
  {
    id: 4,
    image: product04,
    store: amazon,
    category: "Eletrônicos",
    name: "Tablet",
    code: "AS4655",
  },
];

// Componente reutilizável de cartão de produto
function ProductCard({ product }) {
  return (
    <div className="product">
      <div className="product-img">
        <a href="#">
          <img src={product.image} alt={product.name} />
        </a>
        <div className="product-tag">
          <img src={product.store} alt="store" />
        </div>
        <div className="product-label">
          <span className="product-label category">{product.category}</span>
        </div>
      </div>
      <div className="product-body">
        <h3 className="product-name">
          <a href="#">{product.name}</a>
        </h3>
        <h4 className="product-price">Code: {product.code}</h4>
        <div className="product-btns">
          <a className="primary-btn cta-btn" href="#">
            Quero
          </a>
        </div>
      </div>
    </div>
  );
}

// Componente principal da loja
const Store = () => {
  return (
    <div id="store" className="col-md-9">
      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-md-4 col-sm-6">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;
