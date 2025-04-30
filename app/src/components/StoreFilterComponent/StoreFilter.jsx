import React from "react";
import { Container } from "react-bootstrap";
import "./StoreFilter.css";

function StoreFilter({ onFilterChange }) {
  return (
    <Container className="p-5">
      <div className="section-nav">
        <ul className="section-tab-nav tab-nav">
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onFilterChange(null);
              }}
            >
              Todos
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onFilterChange("shopee");
              }}
            >
              Shopee
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onFilterChange("aliexpress");
              }}
            >
              Aliexpress
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onFilterChange("mercadolivre");
              }}
            >
              Mercado Livre
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onFilterChange("amazon");
              }}
            >
              Amazon
            </a>
          </li>
        </ul>
      </div>
    </Container>
  );
}

export default StoreFilter;