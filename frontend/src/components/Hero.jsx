import { Link } from "react-router-dom";
import "../css/hero.css";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-content">

        <h1>
          Achetez et vendez des produits agricoles en toute confiance.
        </h1>

        <p>
          AgriConnect Faso met en relation producteurs, commerçants et
          acheteurs pour faciliter la vente des produits agricoles partout
          au Burkina Faso.
        </p>

        <div className="hero-buttons">
          <Link to="/products" className="btn-primary">
            Voir les produits
          </Link>

          <Link to="/add-product" className="btn-secondary">
            Publier un produit
          </Link>
        </div>

      </div>

      <div className="hero-image">
        <img
          src="/agri2.jpg"
          alt="Agriculture"
        />
      </div>

    </section>
  );
}

export default Hero;