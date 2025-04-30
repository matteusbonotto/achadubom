import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import EmptyStateComponent from '../../utils/EmptyStateComponent';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simulate API call with mock data
        const response = await import('../../data/ProductsData.json');
        setProducts(response.products);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar produtos');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <EmptyStateComponent message={error} />;
  }

  if (products.length === 0) {
    return <EmptyStateComponent message="Nenhum produto encontrado" />;
  }

  return (
    <Row>
      {products.map((product) => (
        <Col key={product.id} md={4} className="mb-4">
          <Card className="product-card">
            <Card.Img variant="top" src={product.image_url} alt={product.name} />
            <Card.Body>
              <Card.Title>{product.name}</Card.Title>
              <Card.Text>{product.description}</Card.Text>
              <div className="d-flex justify-content-between align-items-center">
                <span className="price">R$ {product.price.toFixed(2)}</span>
                <button className="btn btn-primary">Quero</button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProductList; 