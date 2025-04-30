import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./Footer.css";

function Footer() {
  return (
    <footer id="footer">
      <div className="section">
        <Container>
          <Row>
            <Col md={4} xs={6}>
              <div className="footer">
                <h3 className="footer-title">Segue a gente</h3>
                <ul className="footer-links">
                  <a href="https://www.instagram.com/lojaachadubom/" target="_blank">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="https://www.tiktok.com/@achadubom" target="_blank">
                    <i className="bi bi-tiktok"></i>
                  </a>
                  <a href="https://www.youtube.com/@AchaduBom" target="_blank">
                    <i className="bi bi-youtube"></i>
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61574773212871" target="_blank">
                    <i className="bi bi-facebook"></i>
                  </a>{" "}
                  <a href="/login">
                    <i className="bi bi-person"></i>
                  </a>
                </ul>
              </div>
            </Col>
            <Col md={4} xs={6}>
              <div className="footer">
                <h3 className="footer-title">Somos afiliados de</h3>
                <ul className="footer-links">
                  <li>
                    <a href="#">Amazon</a>
                  </li>
                  <li>
                    <a href="#">Mercado livre</a>
                  </li>
                  <li>
                    <a href="#">Shopee</a>
                  </li>
                </ul>
              </div>
            </Col>
            <Col md={4} xs={6}>
              <div className="footer">
                <h3 className="footer-title">Mais informações</h3>
                <ul className="footer-links">
                  <li>
                    <a href="#">Sobre nós</a>
                  </li>
                  <li>
                    <a href="#">Avaliar</a>
                  </li>
                  <li>
                    <a href="#">Termos e condições</a>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div id="bottom-footer" className="section">
        <Container>
          <Row>
            <Col md={12} className="text-center">
              <span className="copyright">
                Copyright &copy; {new Date().getFullYear()} Todos os direitos
                reservados | Desenvolvido por{" "}
                <a
                  href="https://squidev.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "blue" }}
                >
                  Squidev
                </a>
              </span>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
}

export default Footer;
