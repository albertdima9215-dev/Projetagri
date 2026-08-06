
import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/orders.css";

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [trackingNumbers, setTrackingNumbers] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/orders/seller-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (id, statut) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/orders/${id}`,
        {
          statut,
          numeroSuivi: trackingNumbers[id] || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="orders-container">
      <h1>Commandes reçues</h1>

      {orders.length === 0 ? (
        <p>Aucune commande reçue.</p>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order._id}>
            <img
              src={order.produit.image}
              alt={order.produit.nom}
            />

            <div className="order-info">
              <h3>{order.produit.nom}</h3>

              <p><strong>Acheteur :</strong> {order.acheteur.nom}</p>

              <p><strong>Téléphone :</strong> {order.acheteur.telephone}</p>

              <p><strong>Quantité :</strong> {order.quantite}</p>

              <p><strong>Montant :</strong> {order.montant} FCFA</p>
              <p><strong>Date de commande :</strong> {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>

              <span className={`status-badge ${order.statut.replace(/\s/g, "-")}`}>
  {order.statut}
</span>

              {order.statut === "Confirmée" || order.statut === "Expédiée" ? (
  <input
    type="text"
    placeholder="Numéro de suivi"
    value={trackingNumbers[order._id] || ""}
    onChange={(e) =>
      setTrackingNumbers({
        ...trackingNumbers,
        [order._id]: e.target.value,
      })
    }
  />
) : null}

              <select
  value={order.statut}
  onChange={(e) =>
    updateStatus(order._id, e.target.value)
  }
>
  <option>En attente</option>
  <option>Confirmée</option>
  <option>Expédiée</option>
  <option>Livrée</option>
  <option>Annulée</option>
</select>

<div className="quick-actions">
  <button
    className="quick-btn confirm"
    onClick={() => updateStatus(order._id, "Confirmée")}
  >
    ✔ Confirmer
  </button>

  <button
    className="quick-btn ship"
    onClick={() => updateStatus(order._id, "Expédiée")}
  >
    🚚 Expédier
  </button>

  <button
    className="quick-btn deliver"
    onClick={() => updateStatus(order._id, "Livrée")}
  >
    📦 Livrer
  </button>

  <button
    className="quick-btn cancel"
    onClick={() => updateStatus(order._id, "Annulée")}
  >
    ✖ Annuler
  </button>
</div>
              
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default SellerOrders;