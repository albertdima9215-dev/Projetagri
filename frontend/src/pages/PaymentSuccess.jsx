import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "../css/paymentSuccess.css";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!token) {
        setError("Token de paiement absent.");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(
          `/payments/status/${encodeURIComponent(token)}`
        );

        console.log("STATUT PAIEMENT =", res.data);

        setOrder(res.data.order);

      } catch (err) {
        console.error(
          "Erreur vérification paiement :",
          err.response?.data || err
        );

        setError(
          err.response?.data?.message ||
          "Erreur lors de la vérification du paiement."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [token]);

  if (loading) {
    return (
      <div className="payment-success">
        <div className="success-card">
          <h2>Vérification du paiement...</h2>
          <p>Veuillez patienter.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success">
        <div className="success-card">

          <div className="success-icon">
            ❌
          </div>

          <h1>Erreur de paiement</h1>

          <p>{error}</p>

          <div className="success-buttons">
            <Link to="/my-orders">
              Mes commandes
            </Link>

            <Link to="/">
              Retour à l'accueil
            </Link>
          </div>

        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="payment-success">
        <div className="success-card">
          <h2>Aucune commande trouvée.</h2>
        </div>
      </div>
    );
  }

  const paiementTermine =
    order.statutPaiement === "Payé" ||
    order.statutPaiement === "completed";

  return (
    <div className="payment-success">

      <div className="success-card">

        <div className="success-icon">
          {paiementTermine ? "✅" : "⏳"}
        </div>

        <h1>
          {paiementTermine
            ? "Paiement réussi"
            : "Paiement en attente"}
        </h1>

        <p>
          {paiementTermine
            ? "Merci pour votre achat !"
            : "Votre paiement est encore en cours de traitement."}
        </p>

        <hr />

        <p>
          <strong>Produit :</strong>{" "}
          {order.produit?.nom}
        </p>

        <p>
          <strong>Montant :</strong>{" "}
          {order.montant} FCFA
        </p>

        <p>
          <strong>Méthode :</strong>{" "}
          {order.methodePaiement}
        </p>

        <p>
          <strong>Référence :</strong>{" "}
          {order.referencePaiement || "Non disponible"}
        </p>

        <p>
          <strong>Statut :</strong>{" "}
          {order.statutPaiement}
        </p>

        <div className="success-buttons">

          <Link to="/">
            Retour à l'accueil
          </Link>

          <Link to="/my-orders">
            Mes commandes
          </Link>

        </div>

      </div>

    </div>
  );
}

export default PaymentSuccess;