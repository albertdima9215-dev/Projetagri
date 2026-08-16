import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/testimonials.css";

function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get("/reviews/latest");

      setReviews(res.data);
    } catch (error) {
      console.log("Erreur récupération avis :", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (note) => {
    return "⭐".repeat(Number(note));
  };

  if (loading) {
    return (
      <section className="testimonials">
        <h2>Ce que disent nos utilisateurs</h2>

        <div className="testimonial-container">
          {[1, 2, 3].map((item) => (
            <div className="testimonial-card skeleton-testimonial" key={item}>
              <div className="skeleton skeleton-stars"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text short"></div>
              <div className="skeleton skeleton-name"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="testimonials">

      <h2>Ce que disent nos utilisateurs</h2>

      {reviews.length === 0 ? (
        <p className="no-testimonials">
          Aucun avis pour le moment.
        </p>
      ) : (

        <div className="testimonial-container">

          {reviews.map((review) => (

            <div className="testimonial-card" key={review._id}>

              <div className="stars">
                {renderStars(review.note)}
              </div>

              <p className="text">
                "{review.commentaire || "Aucun commentaire"}"
              </p>

              <h3>
                {review.acheteur?.nom || "Utilisateur"}
              </h3>

              <span>
  {review.acheteur?.localisation || "Localisation inconnue"}
              </span>

            </div>

          ))}

        </div>
      )}

    </section>
  );
}

export default Testimonials;