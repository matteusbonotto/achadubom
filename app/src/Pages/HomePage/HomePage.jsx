import React from "react";
import "./HomePage.css";
import HeaderComponent from "../../Components/HeaderComponent/HeaderComponent";
import ProductsComponent from "../../Components/ProductsComponent/ProductsComponent";
import CarrousselComponent from "../../Components/CarrousselComponent/CarrousselComponent";
import FooterComponent from "../../Components/FooterComponent/FooterComponent";
const Home = () => {
  console.log("Home component rendered");

  return (
    <div>
      <HeaderComponent />
      <CarrousselComponent/>
      <ProductsComponent />
      <FooterComponent/>
      </div>
  );
};

export default Home;
