import React from "react";
import "./HomePage.css";
import HeaderComponent from "../../Components/HeaderComponent/HeaderComponent";
import ProductsComponent from "../../Components/ProductsComponent/ProductsComponent";
import CarrousselComponent from "../../Components/CarrousselComponent/CarrousselComponent";

const Home = () => {
  console.log("Home component rendered");

  return (
    <div>
      <HeaderComponent />
      <CarrousselComponent/>
      <ProductsComponent />
      </div>
  );
};

export default Home;
