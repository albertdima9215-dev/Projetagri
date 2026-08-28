import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../css/promoBanner.css";
import { optimizeImage } from "../utils/cloudinary";

function PromoBanner() {
  const [promotions, setPromotions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await api.get("/promotions/active");

      console.log("PROMOTIONS ACTIVES =", res.data);

      setPromotions(res.data || []);
    } catch (error) {
      console.error(
        "Erreur récupération promotions :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Défilement automatique
  useEffect(() => {
    if (promotions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [promotions.length]);

  if (loading) {
    return (
      <section className="promo-banner promo-loading">
        <div className="promo-loading-content">
          Chargement des promotions...
        </div>
      </section>
    );
  }

  // Aucune promotion active
  if (promotions.length === 0) {
    return null;
  }

  const promotion = promotions[current];

  const image =
    promotion.image ||
    promotion.produit?.images?.[0] ||
    promotion.produit?.image;

  const nextSlide = () => {
    setCurrent(
      (prev) => (prev + 1) % promotions.length
    );
  };

  const previousSlide = () => {
    setCurrent(
      (prev) =>
        (prev - 1 + promotions.length) %
        promotions.length
    );
  };

  return (
    <section className="promo-banner">

      {promotions.length > 1 && (
        <button
          className="promo-arrow promo-prev"
          onClick={previousSlide}
          aria-label="Promotion précédente"
        >
          ‹
        </button>
      )}

      <div className="promo-content">

        {/* IMAGE */}
        <div className="promo-icon">

          {image ? (
            <img
              src={optimizeImage(image, 300)}
              alt={promotion.titre}
            />
          ) : (
            "🔥"
          )}

        </div>

        {/* TEXTE */}
        <div className="promo-text">

          <span className="promo-label">
            🔥 OFFRE AGRICONNECT
          </span>

          <h2>
            {promotion.titre}
          </h2>

          {promotion.description && (
            <p>
              {promotion.description}
            </p>
          )}

          {/* PRIX */}
          {(promotion.prixAvant ||
            promotion.prixPromotion) && (
            <div className="promo-prices">

              {promotion.prixAvant && (
                <span className="promo-old-price">
                  {promotion.prixAvant} FCFA
                </span>
              )}

              {promotion.prixPromotion && (
                <strong className="promo-new-price">
                  {promotion.prixPromotion} FCFA
                </strong>
              )}

              {promotion.reduction > 0 && (
                <span className="promo-discount">
                  -{promotion.reduction}%
                </span>
              )}

            </div>
          )}

          {/* BOUTON */}
          {promotion.produit?._id ? (
            <Link
              to={`/products/${promotion.produit._id}`}
              className="promo-btn"
            >
              Voir le produit →
            </Link>
          ) : (
            <Link
              to="/products"
              className="promo-btn"
            >
              Découvrir les produits →
            </Link>
          )}

        </div>

      </div>

      {promotions.length > 1 && (
        <button
          className="promo-arrow promo-next"
          onClick={nextSlide}
          aria-label="Promotion suivante"
        >
          ›
        </button>
      )}

      {/* INDICATEURS */}
      {promotions.length > 1 && (
        <div className="promo-dots">

          {promotions.map((promo, index) => (
            <button
              key={promo._id}
              className={`promo-dot ${
                index === current ? "active" : ""
              }`}
              onClick={() => setCurrent(index)}
              aria-label={`Promotion ${index + 1}`}
            />
          ))}

        </div>
      )}

    </section>
  );
}

export default PromoBanner;