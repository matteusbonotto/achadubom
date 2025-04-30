import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import './Header.css';
import Logo from '../../assets/images/logos/Ativo 1.png';

function Header() {
  return (
    <header>
      <div id="header">
        <Container>
          <Row>
            <Col md={3}>
              <div className="header-logo">
                <a href="/" className="logo">
                  <img src={Logo} width="150" alt="Achadu bom logo" />
                </a>
              </div>
            </Col>
            <Col md={6}>
              <div className="header-search">
                <Form>
                  <Form.Select className="input-select">
                    <option value="0">Todos</option>
                    <option value="1">Category 01</option>
                    <option value="2">Category 02</option>
                  </Form.Select>
                  <Form.Control
                    className="input"
                    placeholder="Procurar aqui"
                    type="text"
                  />
                  <button className="search-btn">Buscar</button>
                </Form>
              </div>
            </Col>
            <Col md={3} className="clearfix">
              <div className="header-ctn">
                <div className="menu-toggle">
                  <a href="#">
                    <i className="bi bi-list"></i>
                    <span>Menu</span>
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </header>
  );
}

export default Header; 