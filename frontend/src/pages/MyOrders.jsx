import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/orders.css";
import { Link } from "react-router-dom";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewData, setReviewData] = useState({
    note: 5,
    commentaire: "",
  });
  

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  const openReviewModal = (order) => {
  setSelectedOrder(order);
  setReviewData({
    note: 5,
    commentaire: "",
  });
  setShowReviewModal(true);
};

const submitReview = async () => {
  try {

    const token = localStorage.getItem("token");

    await api.post(
  "/reviews",
  {
    produit: selectedOrder.produit._id,
    vendeurId: selectedOrder.vendeur._id,
    commande: selectedOrder._id,
    note: reviewData.note,
    commentaire: reviewData.commentaire,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

    alert("Merci pour votre avis.");

    setShowReviewModal(false);

    fetchOrders();

  } catch (error) {

    alert(error.response?.data?.message || "Erreur");

  }
};

  return (
    <div className="orders-container">
      <h1>Mes commandes</h1>

      {orders.length === 0 ? (
        <p>Aucune commande.</p>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order._id}>

            <img
              src={order.produit.image}
              alt={order.produit.nom}
            />

            <div>

              <h3>{order.produit.nom}</h3>

              <p>Quantité : {order.quantite}</p>

              <p>Montant : {order.montant} FCFA</p>

              <p>
                Commandée le :{" "}
  {new             Date(order.createdAt).toLocaleDateString("fr-FR")}
              </p>

              <p className={`status ${order.statut}`}>
                {order.statut}
              </p>

              <p>Vendeur : {order.vendeur.nom}</p>

            </div>

            <Link to={`/products/${order.produit._id}`}>
              Voir le produit
            </Link> 

            <a
  href={`https://wa.me/226${order.vendeur.telephone}`}
  target="_blank"
  rel="noreferrer"
>
              Contacter le vendeur
            </a>

            {order.statut === "Livrée" && !order.avisLaisse && (
              <button
    className="review-btn"
    onClick={() => openReviewModal(order)}
  >
                ⭐ Laisser un avis
              </button>
            )}

          </div>
        ))
      )}

      {order.numeroSuivi && (
        <p>
          🚚 Suivi : <strong>{order.numeroSuivi}</strong>
        </p>
      )}

        {order.dateExpedition && (
          <p>
            📅 Expédiée le :
            {new Date(order.dateExpedition).toLocaleDateString("fr-FR")}
          </p>
        )}

        {order.dateLivraison && (
          <p>
            ✅ Livrée le :
            {new Date(order.dateLivraison).toLocaleDateString("fr-FR")}
          </p>
        )}

      {showReviewModal && (
        <div className="modal-overlay">

          <div className="review-modal">

            <h2>Laisser un avis</h2>

            <label>Note</label>

            <div className="rating-stars">

  {[1, 2, 3, 4, 5].map((star) => (

              <span
      key={star}
      className={
        star <= reviewData.note
          ? "star active"
          : "star"
      }
      onClick={() =>
        setReviewData({
          ...reviewData,
          note: star,
        })
      }
    >
                ★
              </span>

            ))}

          </div>

            <textarea
        placeholder="Votre commentaire..."
        value={reviewData.commentaire}
        onChange={(e) =>
          setReviewData({
            ...reviewData,
            commentaire: e.target.value,
          })
        }
      />

            <div className="modal-buttons">

              <button
          onClick={() => setShowReviewModal(false)}
        >
                Annuler
              </button>

              <button onClick={submitReview}>
                Envoyer
              </button>

            </div>

          </div>

        </div>
      )}

      <div className="order-progress">

  <div className={`step ${["En attente", "Confirmée", "Expédiée", "Livrée"].includes(order.statut) ? "active" : ""}`} >
    <span>1</span>
    <p>Commande</p>
  </div>

  <div className={`step ${["Confirmée", "Expédiée", "Livrée"].includes(order.statut) ? "active" : ""}`} >
    <span>2</span>
    <p>Confirmée</p>
  </div>

  <div className={`step ${["Expédiée", "Livrée"].includes(order.statut) ? "active" : ""}`} >
    <span>3</span>
    <p>Expédiée</p>
  </div>

  <div className={`step ${order.statut === "Livrée" ? "active" : ""}`} >
    <span>4</span>
    <p>Livrée</p>
  </div>

</div>
      
    </div>
  );
}

export default MyOrders;