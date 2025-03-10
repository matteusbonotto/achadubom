import React, { useState, useEffect } from "react";
import "./HeaderComponent.css";
import logo from "../../Assets/images/logo.png";
import { TabMenu } from "primereact/tabmenu";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";

const HeaderComponent = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <header className="header">
      {isMobile && (
        <Button
          icon="pi pi-bars"
          className="menu-button"
          onClick={() => setMenuOpen(true)}
        />
      )}

      <img src={logo} alt="Logo" className="logo" />

      {isMobile ? (
        <Sidebar 
          visible={menuOpen} 
          onHide={() => setMenuOpen(false)} 
          className="mobile-sidebar"
          position="left"
        >
          <div className="mobile-menu">
            {items.map((item, index) => (
              <a 
                key={index} 
                href={item.url} 
                target={item.target}
                className="mobile-menu-item"
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </Sidebar>
      ) : (
        <div className="desktop-menu">
          <TabMenu model={items} />
        </div>
      )}
    </header>
  );
};

export default HeaderComponent;
