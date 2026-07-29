import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/orders.css";

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [trackingNumber, setTrackingNumber] = useState("");

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
        { statut },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await api.put(
  `/orders/${selectedOrder._id}`,
  {
    statut: newStatus,
    numeroSuivi: trackingNumber,
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

              <p className={`status ${order.statut}`}>
                {order.statut}
              </p>

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

              <input
  type="text"
  placeholder="Numéro de suivi"
  value={trackingNumber}
  onChange={(e) => setTrackingNumber(e.target.value)}
/>

            </div>

          </div>
        ))
      )}
    </div>
  );
}

export default SellerOrders;