import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Modal } from 'react-bootstrap';
import ProductForm from '../ProductForm/ProductForm';
import EmptyStateComponent from '../../utils/EmptyStateComponent';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Simulate API call with mock data
      const response = await import('../../data/ProductsData.json');
      setProducts(response.products);
      setCategories(response.categories);
      setStores(response.stores);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = (productId) => {
    // Implement delete functionality
    setProducts(products.filter(p => p.id !== productId));
  };

  const handleSubmit = (formData) => {
    if (selectedProduct) {
      // Update existing product
      setProducts(products.map(p => 
        p.id === selectedProduct.id ? { ...p, ...formData } : p
      ));
    } else {
      // Add new product
      const newProduct = {
        id: Date.now().toString(),
        ...formData
      };
      setProducts([...products, newProduct]);
    }
    setShowModal(false);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <EmptyStateComponent message={error} />;
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Gerenciamento de Produtos</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleAddProduct}>
            Adicionar Produto
          </Button>
        </Col>
      </Row>

      {products.length === 0 ? (
        <EmptyStateComponent message="Nenhum produto cadastrado" />
      ) : (
        <Table responsive hover className="product-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Categoria</th>
              <th>Loja</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>R$ {product.price.toFixed(2)}</td>
                <td>{product.category}</td>
                <td>{product.store}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditProduct(product)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedProduct ? 'Editar Produto' : 'Adicionar Produto'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProductForm
            product={selectedProduct}
            onSubmit={handleSubmit}
            categories={categories}
            stores={stores}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductManagement; 