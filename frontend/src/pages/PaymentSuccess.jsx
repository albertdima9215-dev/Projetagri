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
          "Réponse vérification paiement :",
          res.data
        );

        setOrder(res.data.order);

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

  if (error || !order) {
    return (
      <div className="payment-success">
        <div className="success-card">

          <div className="success-icon">
            ❌
          </div>

          <h1>Paiement non vérifié</h1>

          <p>
            {error ||
              "Aucune information de paiement disponible."}
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
          {order.produit?.nom}
        </p>

        <p>
          <strong>Quantité :</strong>{" "}
          {order.quantite}
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