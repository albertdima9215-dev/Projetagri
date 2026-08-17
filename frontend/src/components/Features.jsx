import "../css/features.css";
import { FaCar,FaLock,FaHandshake,} from "react-icons/fa";
import {GiFruiting} from "react-icons/gi"

function Features() {
  return (
    <section className="features">

      <h2>Pourquoi choisir AgriConnect ?</h2>

      <div className="features-container">

        <div className="feature-card">
          <div className="icon"><GiFruiting /></div>
          <h3>Produits locaux</h3>
          <p>
            Achetez directement auprès des producteurs locaux et profitez
            de produits frais et de qualité.
          </p>
        </div>

        <div className="feature-card">
          <div className="icon"><FaHandshake /></div>
          <h3>Contact direct</h3>
          <p>
            Discutez avec les vendeurs grâce à la messagerie intégrée ou
            via WhatsApp.
          </p>
        </div>

        <div className="feature-card">
          <div className="icon"><FaCar /></div>
          <h3>Livraison facile</h3>
          <p>
            Organisez facilement la livraison avec le vendeur selon votre
            région.
          </p>
        </div>

        <div className="feature-card">
          <div className="icon"><FaLock /></div>
          <h3>Fiable</h3>
          <p>
            Consultez les profils des vendeurs et échangez en toute
            confiance.
          </p>
        </div>

      </div>

    </section>
  );
}

export default Features;