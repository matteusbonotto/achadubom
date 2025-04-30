import React from 'react';

const ProductForm = ({ products }) => {
  return (
    <div>
      {products && products.length > 0 ? (
        products.map((product, index) => (
          <div key={index}>
            <p>{product.name}</p>
          </div>
        ))
      ) : (
        <p>Nenhum produto disponível.</p>
      )}
    </div>
  );
};

export default ProductForm;