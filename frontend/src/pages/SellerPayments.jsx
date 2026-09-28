import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/payments.css";

function SellerPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await api.get("/orders/seller-payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("PAIEMENTS VENDEUR =", res.data);

      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Erreur récupération paiements :", error);
      setError(
        error.response?.data?.message ||
          "Impossible de récupérer les paiements."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payments-container">
        <h1>Paiements reçus</h1>
        <p>Chargement des paiements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payments-container">
        <h1>Paiements reçus</h1>
        <p className="payment-error">{error}</p>

        <button onClick={fetchPayments}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="payments-container">
      <h1>Paiements reçus</h1>

      {payments.length === 0 ? (
        <p>Aucun paiement reçu.</p>
      ) : (
        payments.map((payment) => {
          const produit = payment.produit;
          const acheteur = payment.acheteur;

          return (
            <div key={payment._id} className="payment-card">
              <img
                src={
                  produit?.images?.[0] ||
                  produit?.image ||
                  "/placeholder-product.png"
                }
                alt={produit?.nom || "Produit"}
              />

              <div className="payment-info">
                <h3>{produit?.nom || "Produit indisponible"}</h3>

                <p>
                  <strong>Acheteur :</strong>{" "}
                  {acheteur?.nom || "Acheteur indisponible"}
                </p>

                <p>
                  <strong>Montant :</strong>{" "}
                  {Number(payment.montant || 0).toLocaleString("fr-FR")} FCFA
                </p>

                <p>
                  <strong>Méthode :</strong>{" "}
                  {payment.methodePaiement || "Non renseignée"}
                </p>

                <p
                  className={
                    payment.statutPaiement === "Payé"
                      ? "paid"
                      : "pending"
                  }
                >
                  {payment.statutPaiement === "Payé"
                    ? "✅ Payé"
                    : `⏳ ${payment.statutPaiement || "En attente"}`}
                </p>

                <p>
                  <strong>Date :</strong>{" "}
                  {payment.createdAt
                    ? new Date(payment.createdAt).toLocaleDateString("fr-FR")
                    : "Date inconnue"}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default SellerPayments;