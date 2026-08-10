import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/orders.css";

function ArchivedOrders() {
  const [orders, setOrders] = useState([]);
  const [type, setType] = useState("buyer");

  useEffect(() => {
    fetchOrders();
  }, [type]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const url =
        type === "buyer"
          ? "/orders/archives"
          : "/orders/seller-archives";

      const res = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="orders-container">
      <h1>Archives des commandes</h1>

      <div className="archive-tabs">
        <button
          className={type === "buyer" ? "active" : ""}
          onClick={() => setType("buyer")}
        >
          Mes archives
        </button>

        <button
          className={type === "seller" ? "active" : ""}
          onClick={() => setType("seller")}
        >
          Archives vendeur
        </button>
      </div>

      {orders.length === 0 ? (
        <p>Aucune commande archivée.</p>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order._id}>
            <img
              src={order.produit?.images?.[0] || order.produit?.image}
              alt={order.produit?.nom}
            />

            <div className="order-info">
              <h3>{order.produit?.nom}</h3>

              <p>
                <strong>Statut :</strong> {order.statut}
              </p>

              <p>
                <strong>Montant :</strong> {order.montant} FCFA
              </p>

              <p>
                <strong>Date :</strong> {new Date(order.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ArchivedOrders;