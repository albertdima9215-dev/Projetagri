import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/payments.css";

function SellerPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/orders/seller-payments", {
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
      <h1>Paiements reçus</h1>

      {payments.length === 0 ? (
        <p>Aucun paiement reçu.</p>
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
                <strong>Acheteur :</strong> {payment.acheteur.nom}
              </p>

              <p>
                <strong>Montant :</strong> {payment.montant} FCFA
              </p>

              <p>
                <strong>Méthode :</strong> {payment.methodePaiement}
              </p>

              <p className="paid">✅ Payé</p>

              <p>
                <strong>Date :</strong> {new Date(payment.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default SellerPayments;
