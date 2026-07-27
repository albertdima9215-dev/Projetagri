import { Link } from "react-router-dom";
import "../css/footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-section">
          <h2>AgriConnect Faso</h2>

          <p>
            La plateforme qui met en relation les producteurs,
            commerçants et acheteurs de produits agricoles
            partout au Burkina Faso.
          </p>
        </div>

        <div className="footer-section">
          <h3>Liens utiles</h3>

          <Link to="/">Accueil</Link>
          <Link to="/products">Produits</Link>
          <Link to="/add-product">Publier un produit</Link>
          <Link to="/dashboard">Mon tableau de bord</Link>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>

          <p>Ouagadougou, Burkina Faso</p>
          <p>+226 XX XX XX XX</p>
          <p>contact@agriconnectfaso.com</p>
        </div>

        <div className="footer-section">
          <h3>Suivez-nous</h3>

          <a href="#">Facebook</a>
          <a href="#">WhatsApp</a>
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
        </div>

      </div>

      <hr />

      <div className="footer-bottom">
        © {new Date().getFullYear()} AgriConnect Faso - Tous droits réservés.
      </div>

    </footer>
  );
}

export default Footer;