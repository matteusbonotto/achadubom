import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './AdminPage.css';

const AdminPage = () => {
  return (
    <div className="admin-page">
      <Header />
      <main>
        <Container>
          <Row>
            <Col>
              <h1 className="text-center my-4">Painel Administrativo</h1>
              <Row>
                <Col md={4}>
                  <Card className="admin-card">
                    <Card.Body>
                      <Card.Title>Produtos</Card.Title>
                      <Card.Text>
                        Gerencie os produtos do site
                      </Card.Text>
                      <button className="btn btn-primary">Gerenciar</button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="admin-card">
                    <Card.Body>
                      <Card.Title>Categorias</Card.Title>
                      <Card.Text>
                        Gerencie as categorias de produtos
                      </Card.Text>
                      <button className="btn btn-primary">Gerenciar</button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="admin-card">
                    <Card.Body>
                      <Card.Title>Lojas</Card.Title>
                      <Card.Text>
                        Gerencie as lojas parceiras
                      </Card.Text>
                      <button className="btn btn-primary">Gerenciar</button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage; 