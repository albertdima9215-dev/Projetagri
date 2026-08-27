import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/promoBanner.css";

const promotions = [
  {
    id: 1,
    icon: "🥔",
    title: "Offres spéciales sur les produits agricoles",
    text: "Profitez de nos meilleures offres et trouvez des produits de qualité près de chez vous.",
    button: "Découvrir les produits",
    link: "/products",
  },
  {
    id: 2,
    icon: "🌾",
    title: "Les produits locaux à l'honneur",
    text: "Découvrez les produits proposés directement par les producteurs et vendeurs locaux.",
    button: "Voir les produits",
    link: "/products",
  },
  {
    id: 3,
    icon: "🚚",
    title: "Achetez simplement et suivez votre commande",
    text: "Commandez vos produits, payez en ligne avec PayDunya et suivez votre livraison.",
    button: "Commencer mes achats",
    link: "/products",
  },
];

function PromoBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const promotion = promotions[current];

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % promotions.length);
  };

  const previousSlide = () => {
    setCurrent(
      (prev) => (prev - 1 + promotions.length) % promotions.length
    );
  };

  return (
    <section className="promo-banner">

      <button
        className="promo-arrow promo-prev"
        onClick={previousSlide}
        aria-label="Promotion précédente"
      >
        ‹
      </button>

      <div className="promo-content">

        <div className="promo-icon">
          {promotion.icon}
        </div>

        <div className="promo-text">
          <span className="promo-label">
            OFFRE AGRICONNECT
          </span>

          <h2>{promotion.title}</h2>

          <p>{promotion.text}</p>

          <Link to={promotion.link} className="promo-btn">
            {promotion.button} →
          </Link>
        </div>

      </div>

      <button
        className="promo-arrow promo-next"
        onClick={nextSlide}
        aria-label="Promotion suivante"
      >
        ›
      </button>

      <div className="promo-dots">
        {promotions.map((promo, index) => (
          <button
            key={promo.id}
            className={`promo-dot ${
              index === current ? "active" : ""
            }`}
            onClick={() => setCurrent(index)}
            aria-label={`Promotion ${index + 1}`}
          />
        ))}
      </div>

    </section>
  );
}

export default PromoBanner;