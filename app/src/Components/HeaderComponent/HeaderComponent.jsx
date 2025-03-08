import React from "react";
import "./HeaderComponent.css";
import logo from "../../Assets/images/logo.png";
import { TabMenu } from "primereact/tabmenu";

const HeaderComponent = () => {
  const items = [
    { label: "Início", icon: "pi pi-home", url: "#" },
    {
      label: "Instagram",
      icon: "pi pi-instagram",
      url: "https://www.instagram.com/lojaachadubom/",
      target: "_blank",
    },
    {
      label: "TikTok",
      icon: "pi pi-tiktok",
      url: "https://www.tiktok.com/@achadubom",
      target: "_blank",
    },
    {
      label: "Shopee",
      icon: "pi pi-shopping-bag",
      url: "https://shopee.com.br/shop/467080933",
      target: "_blank",
    },
    {
      label: "Amazon",
      icon: "pi pi-amazon",
      url: "https://www.amazon.com.br/s?k=achadubom",
      target: "_blank",
    },
  ];

  return (
    <header className="header text-center">
      <img src={logo} alt="" />
      <TabMenu model={items} />
    </header>
  );
};

export default HeaderComponent;
