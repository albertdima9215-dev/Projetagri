import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../css/payments.css";

function MyPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/orders/my-payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPayments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="payments-container">
      <h1>Mes paiements</h1>

      {payments.length === 0 ? (
        <p>Aucun paiement effectué.</p>
      ) : (
        payments.map((payment) => (
          <div key={payment._id} className="payment-card">
            <img
              src={payment.produit.image}
              alt={payment.produit.nom}
            />

            <div className="payment-info">
              <h3>{payment.produit.nom}</h3>

              <p>
                <strong>Vendeur :</strong> {payment.vendeur.nom}
              </p>

              <p>
                <strong>Montant :</strong> {payment.montant} FCFA
              </p>

              <p>
                <strong>Méthode :</strong> {payment.methodePaiement}
              </p>

              <p className={payment.statutPaiement === "Payé" ? "paid" : "pending"}>
  {payment.statutPaiement === "Payé"
    ? "✅ Payé"
    : `⏳ ${payment.statutPaiement}`}
</p>

              <p>
                <strong>Date :</strong> {new Date(payment.createdAt).toLocaleDateString("fr-FR")}
              </p>

              <Link
                to={`/products/${payment.produit._id}`}
                className="view-product-btn"
              >
                Voir le produit
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyPayments;
