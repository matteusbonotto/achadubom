import React, { useState } from "react";
import "./HighlightProducts.css";
import Slider from "react-slick";
import product01 from "../../assets/images/products/product01.png";
import product02 from "../../assets/images/products/product02.png";
import product03 from "../../assets/images/products/product03.png";
import product04 from "../../assets/images/products/product04.png";

import aliexpress from "../../assets/images/icons/aliexpress.png";
import amazon from "../../assets/images/icons/amazon.png";
import shopee from "../../assets/images/icons/shopee.png";
import mercadolivre from "../../assets/images/icons/mercadolivre.png";

// Arrays dos produtos
const virais = [
  {
    id: 1,
    image: product01,
    store: "shopee",
    category: "Eletrônicos",
    name: "Notebook",
    code: "AS4652",
  },
  {
    id: 2,
    image: product02,
    store: "aliexpress",
    category: "Eletrônicos",
    name: "Headphone",
    code: "AS4653",
  },
];

const top10 = [
  {
    id: 6,
    image: product03,
    store: "mercadolivre",
    category: "Eletrônicos",
    name: "Notebook",
    code: "AS4654",
  },
  {
    id: 7,
    image: product04,
    store: "amazon",
    category: "Eletrônicos",
    name: "Notebook",
    code: "AS4655",
  },
];

const maisVendidos = [
  {
    id: 10,
    image: product04,
    store: "amazon",
    category: "Eletrônicos",
    name: "Tablet",
    code: "AS4656",
  },
];

// Configurações do carrossel
const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  responsive: [
    { breakpoint: 992, settings: { slidesToShow: 2 } },
    { breakpoint: 576, settings: { slidesToShow: 1 } },
  ],
};

// Componente reutilizável de cartão
function ProductCard({ product }) {
  return (
    <>
      <div className="product-img">
        <a href="#">
          <img src={product.image} alt={product.name} />
        </a>
        <div className="product-tag">
          <img src={require(`../../assets/images/icons/${product.store}.png`)} alt="store" />
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
    </>
  );
}

// Componente que renderiza o carrossel ou grade
function ProductCarousel({ title, products }) {
  const showSlider = products.length > 3;

  return (
    <div className="container">
      <div className="group-carousel">
        <h3 className="title">{title}</h3>
        {showSlider ? (
          <Slider {...settings}>
            {products.map((product) => (
              <div key={product.id} className="product">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="row">
            {products.map((product) => (
              <div key={product.id} className="col-md-3 col-sm-6">
                <div className="product">
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente principal
function HighlightProducts() {
  const [selectedStore, setSelectedStore] = useState(null);

  // Função para filtrar produtos por loja
  const filterProducts = (products) => {
    return selectedStore
      ? products.filter((product) => product.store === selectedStore)
      : products;
  };

  return (
    <div className="section p-5">
      <div className="store-filter section-nav">
        <ul className="section-tab-nav">
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedStore(null);
              }}
              className={selectedStore === null ? "active" : ""}
            >
              Todos
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedStore("shopee");
              }}
              className={selectedStore === "shopee" ? "active" : ""}
            >
              Shopee
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedStore("aliexpress");
              }}
              className={selectedStore === "aliexpress" ? "active" : ""}
            >
              Aliexpress
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedStore("mercadolivre");
              }}
              className={selectedStore === "mercadolivre" ? "active" : ""}
            >
              Mercado Livre
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedStore("amazon");
              }}
              className={selectedStore === "amazon" ? "active" : ""}
            >
              Amazon
            </a>
          </li>
        </ul>
      </div>
      <ProductCarousel title="Virais" products={filterProducts(virais)} />
      <ProductCarousel title="Top 10" products={filterProducts(top10)} />
      <ProductCarousel title="+Vendidos" products={filterProducts(maisVendidos)} />
    </div>
  );
}

export default HighlightProducts;
