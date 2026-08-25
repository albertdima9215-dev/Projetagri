import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "../css/paymentSuccess.css";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!token) {
          setError("Token de paiement manquant.");
          return;
        }

        console.log("Token PayDunya :", token);

        const authToken = localStorage.getItem("token");

        const res = await api.get(
          `/payments/status/${encodeURIComponent(token)}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        console.log(
          "Vérification paiement :",
          res.data
        );

        setOrder(res.data.order);
        setPaymentStatus(res.data.paymentStatus);

      } catch (error) {
        console.error(
          "Erreur vérification paiement :",
          error.response?.data || error
        );

        setError(
          error.response?.data?.message ||
          "Impossible de vérifier le paiement."
        );

      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [token]);

  // Chargement
  if (loading) {
    return (
      <div className="payment-success">
        <div className="success-card">

          <div className="success-icon">
            ⏳
          </div>

          <h1>Vérification du paiement</h1>

          <p>
            Nous vérifions votre paiement auprès de PayDunya...
          </p>

        </div>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="payment-success">
        <div className="success-card">

          <div className="success-icon">
            ❌
          </div>

          <h1>Erreur de paiement</h1>

          <p>
            {error}
          </p>

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

  // Paiement en attente
  if (paymentStatus === "pending") {
    return (
      <div className="payment-success">
        <div className="success-card">

          <div className="success-icon">
            ⏳
          </div>

          <h1>Paiement en attente</h1>

          <p>
            Votre paiement n'est pas encore confirmé
            par PayDunya.
          </p>

          {order && (
            <>
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
                <strong>Référence :</strong>{" "}
                {order.referencePaiement || "-"}
              </p>
            </>
          )}

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

  // Paiement confirmé
  if (paymentStatus === "completed") {
    return (
      <div className="payment-success">

        <div className="success-card">

          <div className="success-icon">
            ✅
          </div>

          <h1>Paiement réussi</h1>

          <p>
            Merci pour votre achat !
          </p>

          <hr />

          <p>
            <strong>Produit :</strong>{" "}
            {order?.produit?.nom}
          </p>

          <p>
            <strong>Quantité :</strong>{" "}
            {order?.quantite}
          </p>

          <p>
            <strong>Montant :</strong>{" "}
            {order?.montant} FCFA
          </p>

          <p>
            <strong>Méthode :</strong>{" "}
            {order?.methodePaiement}
          </p>

          <p>
            <strong>Référence :</strong>{" "}
            {order?.referencePaiement || "-"}
          </p>

          <p>
            <strong>Statut :</strong>{" "}
            {order?.statutPaiement}
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

  // Autre statut
  return (
    <div className="payment-success">

      <div className="success-card">

        <div className="success-icon">
          ⚠️
        </div>

        <h1>Statut du paiement</h1>

        <p>
          Statut PayDunya :{" "}
          <strong>{paymentStatus || "inconnu"}</strong>
        </p>

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

export default PaymentSuccess;