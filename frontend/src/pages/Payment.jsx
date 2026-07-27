import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/payment.css";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const { order } = location.state;

  const [method, setMethod] = useState("Orange Money");
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.post(
        "/payments/pay",
        {
          orderId: order._id,
          methodePaiement: method,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/payment-success", {
        state: {
        order: res.data.order,
        },
      });

    } catch (error) {
      alert(error.response?.data?.message || "Erreur");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">

      <div className="payment-card">

        <h1>Paiement</h1>

        <h2>{order.produit.nom}</h2>

        <p>
          Quantité : <strong>{order.quantite}</strong>
        </p>

        <p>
          Total : <strong>{order.montant} FCFA</strong>
        </p>

        <label>Méthode de paiement</label>

        <div className="payment-methods">

        <div
    className={`payment-option ${
      method === "Orange Money" ? "active" : ""
    }`}
    onClick={() => setMethod("Orange Money")}
  >
          🟧
          <h3>Orange Money</h3>
        </div>

        <div
    className={`payment-option ${
      method === "Wave" ? "active" : ""
    }`}
    onClick={() => setMethod("Wave")}
  >
          🔵
          <h3>Wave</h3>
        </div>

        <div
    className={`payment-option ${
      method === "Moov Money" ? "active" : ""
    }`}
    onClick={() => setMethod("Moov Money")}
  >
          🟢
          <h3>Moov Money</h3>
        </div>

        <div
    className={`payment-option ${
      method === "À la livraison" ? "active" : ""
    }`}
    onClick={() => setMethod("À la livraison")}
  >
          🚚
          <h3>Paiement à la livraison</h3>
        </div>

        </div>

        <button
  className="pay-btn"
  onClick={pay}
  disabled={loading}
>
          {loading
          ? "Traitement du paiement..."
          : `Payer avec ${method}`}
        </button>

      </div>

    </div>
  );
}

export default Payment;