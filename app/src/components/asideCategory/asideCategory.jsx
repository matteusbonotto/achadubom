import React from 'react';
import './asideCategory.css';

const categories = [
  {
    title: 'Categorias',
    items: [
      { id: 'category-1', label: 'Eletrônicos', count: 120 },
      { id: 'category-2', label: 'Casa', count: 740 },
      { id: 'category-3', label: 'Pets', count: 320 },
      { id: 'category-4', label: 'Cozinha', count: 540 },
      { id: 'category-5', label: 'Esportes', count: 230 },
      { id: 'category-6', label: 'Moda', count: 670 },
    ],
  },
  {
    title: 'Loja',
    items: [
      { id: 'store-1', label: 'Todos', count: 1200 },
      { id: 'store-2', label: 'Mercado Livre', count: 450 },
      { id: 'store-3', label: 'Amazon', count: 380 },
      { id: 'store-4', label: 'Aliexpress', count: 290 },
      { id: 'store-5', label: 'Shopee', count: 740 },
    ],
  },
  {
    title: 'Outro',
    items: [
      { id: 'other-1', label: 'Laptops', count: 120 },
      { id: 'other-2', label: 'Smartphones', count: 740 },
      { id: 'other-3', label: 'Tablets', count: 210 },
      { id: 'other-4', label: 'Acessórios', count: 450 },
      { id: 'other-5', label: 'Consoles', count: 180 },
    ],
  },
  {
    title: 'Promoções',
    items: [
      { id: 'promo-1', label: 'Descontos acima de 50%', count: 90 },
      { id: 'promo-2', label: 'Frete grátis', count: 150 },
      { id: 'promo-3', label: 'Ofertas relâmpago', count: 60 },
    ],
  },
  {
    title: 'Marcas',
    items: [
      { id: 'brand-1', label: 'Apple', count: 320 },
      { id: 'brand-2', label: 'Samsung', count: 450 },
      { id: 'brand-3', label: 'Sony', count: 210 },
      { id: 'brand-4', label: 'LG', count: 180 },
      { id: 'brand-5', label: 'Dell', count: 150 },
    ],
  },
];

function AsideCategory() {
  return (
    <div id="aside" className="col-md-3">
      <div className="aside">
        {categories.map((category, index) => (
          <div key={index}>
            <h3 className="aside-title">{category.title}</h3>
            <div className="checkbox-filter">
              {category.items.map((item) => (
                <div className="input-checkbox" key={item.id}>
                  <input type="checkbox" id={item.id} />
                  <label htmlFor={item.id}>
                    <span></span>
                    {item.label}
                    <small>({item.count})</small>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AsideCategory;