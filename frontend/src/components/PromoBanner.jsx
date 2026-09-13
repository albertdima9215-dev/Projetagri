import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../css/promoBanner.css";
import { optimizeImage } from "../utils/cloudinary";

// Formatters produits
import {
  formatUnite,
  formatUnitePluriel,
  getSaleTypeLabel,
} from "../utils/productFormatters";

// Icons
import { FaFireAlt } from "react-icons/fa";

function PromoBanner() {
  const [promotions, setPromotions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     RÉCUPÉRER LES PROMOTIONS
     ========================================================= */

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await api.get("/promotions/active");

      console.log(
        "PROMOTIONS ACTIVES =",
        res.data
      );

      setPromotions(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error(
        "Erreur récupération promotions :",
        error
      );

      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     DÉFILEMENT AUTOMATIQUE
     ========================================================= */

  useEffect(() => {
    if (promotions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent(
        (prev) =>
          (prev + 1) % promotions.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [promotions.length]);

  /* =========================================================
     CHARGEMENT
     ========================================================= */

  if (loading) {
    return (
      <section className="promo-banner promo-loading">
        <div className="promo-loading-content">
          Chargement des promotions...
        </div>
      </section>
    );
  }

  /* =========================================================
     AUCUNE PROMOTION
     ========================================================= */

  if (promotions.length === 0) {
    return null;
  }

  /* =========================================================
     SÉCURISER L'INDEX
     ========================================================= */

  const safeCurrent =
    current >= 0 &&
    current < promotions.length
      ? current
      : 0;

  const promotion =
    promotions[safeCurrent];

  const product =
    promotion?.produit;

  /* =========================================================
     IMAGE
     ========================================================= */

  const image =
    promotion?.image ||
    product?.images?.[0] ||
    product?.image ||
    "";

  /* =========================================================
     INFORMATIONS PRODUIT
     ========================================================= */

  const saleType =
    product
      ? getSaleTypeLabel(product)
      : null;

  const unite =
    product?.unite
      ? formatUnite(product.unite)
      : "";

  /* =========================================================
     COMPOSITION DU LOT
     ========================================================= */

  const quantiteParLot = Number(
    product?.quantiteParLot || 0
  );

  const lotComposition =
    product?.typeVente === "lot" &&
    quantiteParLot > 0
      ? `${quantiteParLot} ${formatUnitePluriel(
          product.unite,
          quantiteParLot
        )} / lot`
      : null;

  /* =========================================================
     FORMAT DES PRIX
     ========================================================= */

  const prixAvant =
    Number(promotion?.prixAvant);

  const prixPromotion =
    Number(promotion?.prixPromotion);

  const hasPrixAvant =
    Number.isFinite(prixAvant) &&
    prixAvant > 0;

  const hasPrixPromotion =
    Number.isFinite(prixPromotion) &&
    prixPromotion > 0;

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const nextSlide = () => {
    setCurrent(
      (prev) =>
        (prev + 1) % promotions.length
    );
  };

  const previousSlide = () => {
    setCurrent(
      (prev) =>
        (prev - 1 + promotions.length) %
        promotions.length
    );
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <section className="promo-banner">

      {/* =====================================================
          FLÈCHE PRÉCÉDENTE
          ===================================================== */}

      {promotions.length > 1 && (
        <button
          type="button"
          className="promo-arrow promo-prev"
          onClick={previousSlide}
          aria-label="Promotion précédente"
        >
          ‹
        </button>
      )}

      {/* =====================================================
          CONTENU
          ===================================================== */}

      <div className="promo-content">

        {/* ===================================================
            IMAGE
            =================================================== */}

        <div className="promo-icon">

          {image ? (
            <img
              src={optimizeImage(image, 300)}
              alt={
                promotion?.titre ||
                product?.nom ||
                "Promotion AgriConnect"
              }
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <FaFireAlt />
          )}

        </div>

        {/* ===================================================
            TEXTE
            =================================================== */}

        <div className="promo-text">

          {/* Label */}

          <span className="promo-label">
            <FaFireAlt className="fire" />
            OFFRE AGRICONNECT
          </span>

          {/* Titre */}

          <h2>
            {promotion?.titre}
          </h2>

          {/* Description */}

          {promotion?.description && (
            <p className="promo-description">
              {promotion.description}
            </p>
          )}

          {/* =================================================
              TYPE DE VENTE
              ================================================= */}

          {saleType && (
            <div className="promo-product-info">

              <span className="promo-sale-type">
                {saleType}
              </span>

              {unite && (
                <span className="promo-unit">
                  / {unite}
                </span>
              )}

            </div>
          )}

          {/* =================================================
              COMPOSITION DU LOT
              ================================================= */}

          {lotComposition && (
            <p className="promo-lot">
              {lotComposition}
            </p>
          )}

          {/* =================================================
              PRIX
              ================================================= */}

          {(hasPrixAvant ||
            hasPrixPromotion) && (
            <div className="promo-prices">

              {/* Ancien prix */}

              {hasPrixAvant && (
                <span className="promo-old-price">
                  {prixAvant.toLocaleString(
                    "fr-FR"
                  )}{" "}
                  FCFA
                </span>
              )}

              {/* Nouveau prix */}

              {hasPrixPromotion && (
                <strong className="promo-new-price">
                  {prixPromotion.toLocaleString(
                    "fr-FR"
                  )}{" "}
                  FCFA
                </strong>
              )}

              {/* Réduction */}

              {Number(
                promotion?.reduction || 0
              ) > 0 && (
                <span className="promo-discount">
                  -
                  {Number(
                    promotion.reduction
                  )}
                  %
                </span>
              )}

            </div>
          )}

          {/* =================================================
              BOUTON
              ================================================= */}

          {product?._id ? (
            <Link
              to={`/products/${product._id}`}
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

      {/* =====================================================
          FLÈCHE SUIVANTE
          ===================================================== */}

      {promotions.length > 1 && (
        <button
          type="button"
          className="promo-arrow promo-next"
          onClick={nextSlide}
          aria-label="Promotion suivante"
        >
          ›
        </button>
      )}

      {/* =====================================================
          INDICATEURS
          ===================================================== */}

      {promotions.length > 1 && (
        <div className="promo-dots">

          {promotions.map(
            (promo, index) => (
              <button
                type="button"
                key={promo._id || index}
                className={`promo-dot ${
                  index === safeCurrent
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setCurrent(index)
                }
                aria-label={`Promotion ${
                  index + 1
                }`}
              />
            )
          )}

        </div>
      )}

    </section>
  );
}

export default PromoBanner;