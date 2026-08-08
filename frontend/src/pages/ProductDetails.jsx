import { useEffect, useState} from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "../css/productDetails.css";
import { useNavigate } from "react-router-dom";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  const [showOrder, setShowOrder] = useState(false);
  const [quantite, setQuantite] = useState(1);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [])
  

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const startConversation = async () => {
  try {
    const token = localStorage.getItem("token");

    await api.post(
      "/messages",
      {
        destinataireId: product.vendeur._id,
        contenu: "Bonjour, je suis intéressé par votre produit.",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    navigate("/messages");

  } catch (error) {
    alert(error.response?.data?.message || "Erreur");
  }
};

  const createOrder = async () => {
  try {
    const token =         localStorage.getItem("token");

    const res = await api.post(
      "/orders",
      {
        produitId: product._id,
        quantite,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert(res.data.message);

    setShowOrder(false);

    navigate("/payment", {
      state: {
      order: res.data.commande,
      }
    });

  } catch (error) {
    alert(error.response?.data?.message || "Erreur");
  }
};

 const fetchReviews = async () => {
  const res = await         api.get(`/reviews/product/${id}`);
  setReviews(res.data);
}; 

  if (!product) {
    return <h2>Chargement...</h2>;
  }

  return (
    <div className="product-details">

      <div className="product-image">
        <img src={product.image} alt={product.nom} />
      </div>

      <div className="product-info">

        <h1>{product.nom}</h1>

        <h2>{product.prix} FCFA</h2>

        <p>
          <strong>Catégorie :</strong> {product.categorie}
        </p>

        <p>
          <strong>Quantité :</strong> {product.quantite}
        </p>

        <p>
          <strong>Localisation :</strong> {product.localisation}
        </p>

        <p>
          <strong>Description :</strong>
        </p>

        <p>{product.description}</p>

        <hr />

        <h3>Vendeur</h3>

        <Link className="link-nom-vendeur" to={`/seller/${product.vendeur._id}`}>
    {product.vendeur.nom}
        </Link>

        <p>{product.vendeur.email}</p>
        <button
  className="message-btn"
  onClick={startConversation}
>
          Envoyer un message
        </button>
        <a
  href={`https://wa.me/226${product.vendeur.telephone}?text=Bonjour, je suis intéressé par votre produit : ${product.nom}`}
  target="_blank"
  rel="noreferrer"
  className="whatsapp-btn"
>
          Contacter sur WhatsApp
        </a>

        {product.quantite > 0 ? (
          <button
    className="order-btn"
    onClick={() => setShowOrder(true)}
  >
            Commander
          </button>
          ) : (
          <div className="out-of-stock">
            ❌ Rupture de stock
          </div>
        )}

      </div>

      {showOrder && (
      <div
  className="order-modal"
  onClick={() => setShowOrder(false)}
>
        <div
  className="order-content"
  onClick={(e) => e.stopPropagation()}
>
          <h2>Commander le produit</h2>

          <p>
        Produit : <strong>{product.nom}                  </strong>
          </p>

          <p>
            Prix unitaire : <strong>{product.prix} FCFA</strong>
          </p>

          <label>Quantité</label>

          <input
            type="number"
            min="1"
            max={product.quantite}
            value={quantite}
            onChange={(e) =>               setQuantite(e.target.value)}
          />

          <h3>Total : {product.prix * quantite} FCFA</h3>

          <button onClick={createOrder}>
            Confirmer la commande
          </button>

          <button onClick={() => setShowOrder(false)}>
            Annuler
          </button>

        </div>

      </div>
      )}

      <div className="reviews-section">
  <h2>Avis des acheteurs</h2>

  {reviews.length === 0 ? (
    <p>Aucun avis pour le moment.</p>
  ) : (
    reviews.map((review) => (
      <div key={review._id} className="review-card">
        <strong>{review.acheteur.nom}</strong>

        <p>{"⭐".repeat(review.note)}</p>

        <p>{review.commentaire}</p>

        <small>
          {new Date(review.createdAt).toLocaleDateString("fr-FR")}
        </small>
      </div>
    ))
  )}
</div>

    </div>
  );
}

export default ProductDetails;