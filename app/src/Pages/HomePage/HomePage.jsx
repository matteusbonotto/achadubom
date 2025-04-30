import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Banner from "../../components/Banner/Banner";
import Footer from "../../components/Footer/Footer";
import StoreFilter from "../../components/StoreFilterComponent/StoreFilter";
import HighlightProducts from "../../components/HighlightProducts/HighlightProducts";
import AsideCategory from "../../components/asideCategory/asideCategory";
import Store from "../../components/store/store";
import "./HomePage.css";

function HomePage() {
  const [showStore, setShowStore] = useState(false); // Estado para alternar entre Highlight e Store

  return (
    <div>
      <Header />
      {!showStore ? (
        <>
          <Banner />
          <HighlightProducts />
          <div className="text-center p-5">
            <button
              onClick={() => setShowStore(true)}
              className="btn btn-primary col-4 rounded-pill"
            >
              Ver mais
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="p-3">
            <button
              onClick={() => setShowStore(false)}
              className="btn btn-primary rounded-circle"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </div>
          <div className="section p-5">
            <div className="container">
              <div className="row">
                <AsideCategory />
                <Store />
              </div>
            </div>
          </div>
        </>
      )}
      <Footer />
    </div>
  );
}

export default HomePage;
