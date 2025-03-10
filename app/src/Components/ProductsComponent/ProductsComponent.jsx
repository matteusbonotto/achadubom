import React, { useState, useEffect } from "react";
import { ProductService } from "../../Services/ProductService";
import { Button } from "primereact/button";
import { DataView, DataViewLayoutOptions } from "primereact/dataview";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import "./ProductsComponent.css";

export default function ProductsComponent() {
  const [products, setProducts] = useState([]);
  const [layout, setLayout] = useState("grid");

  useEffect(() => {
    ProductService.getProducts().then((data) => setProducts(data.slice(0, 12)));
  }, []);

  const getSeverity = (product) => {
    switch (product.inventoryStatus) {
      case "Em Alta":
        return "warning";
      case "Top":
        return "danger";
      default:
        return null;
    }
  };

  const listItem = (product) => {
    return (
      <div className="product-list-item" key={product.id}>
        <div className="product-list-item-content">
          <img
            className="product-list-image"
            src={product.image}
            alt={product.name}
          />
          <div className="product-list-detail">
            <div className="product-list-info">
            <div className="product-category">
                <i className="pi pi-tag product-category-icon"></i>
                <span className="product-category-text">
                  {product.category}
                </span>
                <Tag
                    value={product.inventoryStatus}
                    severity={getSeverity(product)}
                    className="tag"
                  ></Tag>
              </div>
              <div className="product-name">{product.name}</div>
              <Rating value={product.rating} readOnly cancel={false}></Rating>
            </div>
            <div className="product-list-action">
              <span className="product-code">Código: {product.code}</span>
              <Button icon="" className="p-button-rounded">
                Eu quero
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const gridItem = (product) => {
    return (
      <div className="product-grid-item" key={product.id}>
        <div className="product-grid-item-content">
          <div className="product-grid-item-top">
            <div className="product-category">
              <i className="pi pi-tag product-category-icon"></i>
              <span className="product-category-text">{product.category}</span>
            </div>
            <Tag
              value={product.inventoryStatus}
              severity={getSeverity(product)}
              className="status-tag"
            ></Tag>
          </div>
          <div className="product-grid-detail">
            <img src={product.image} alt={product.name} />
            <div className="product-name">{product.name}</div>
            <Rating value={product.rating} readOnly cancel={false}></Rating>
          </div>
          <div className="product-grid-action">
            <span className="product-code">Código: {product.code}</span>
            <Button
              icon=""
              className="p-button-rounded"
              onClick={() =>
                window.open("https://tinyurl.com/" + product.code, "_blank")
              }
            >
              Eu quero
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const itemTemplate = (product, layout) => {
    if (!product) {
      return;
    }

    if (layout === "list") return listItem(product);
    else if (layout === "grid") return gridItem(product);
  };

  const listTemplate = (products, layout) => {
    return (
      <div className="grid-nogutter">
        {products.map((product) => itemTemplate(product, layout))}
      </div>
    );
  };

  const header = () => {
    return (
      <div className="flex justify-content-end">
        <DataViewLayoutOptions
          layout={layout}
          onChange={(e) => setLayout(e.value)}
        />
      </div>
    );
  };

  return (
    <div className="card">
      <DataView
        value={products}
        listTemplate={listTemplate}
        layout={layout}
        header={header()}
      />
    </div>
  );
}
