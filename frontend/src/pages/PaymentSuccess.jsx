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

      if (!token) {
        setError("Token de paiement absent.");
        setLoading(false);
        return;
      }

      try {
        console.log(
          "Vérification du paiement avec le token :",
          token
        );

        const res = await api.get(
          `/payments/status/${encodeURIComponent(token)}`
        );

        console.log(
          "Réponse vérification paiement :",
          res.data
        );

        if (!res.data?.success) {
          throw new Error(
            res.data?.message ||
            "Impossible de vérifier le paiement."
          );
        }

        setPaymentStatus(
          res.data.paymentStatus || ""
        );

        setOrder(
          res.data.order || null
        );

      } catch (err) {

        console.error(
          "Erreur vérification paiement :",
          err.response?.data || err
        );

        setError(
          err.response?.data?.message ||
          err.message ||
          "Erreur lors de la vérification du paiement."
        );

      } finally {
        setLoading(false);
      }
    };

    verifyPayment();

  }, [token]);

  // ================================
  // VÉRIFICATION EN COURS
  // ================================

  if (loading) {
    return (
      <div className="payment-success">

        <div className="success-card">

          <div className="success-icon">
            ⏳
          </div>

          <h2>
            Vérification du paiement...
          </h2>

          <p>
            Nous vérifions votre transaction auprès de PayDunya.
          </p>

          <p>
            Veuillez patienter quelques secondes.
          </p>

        </div>

      </div>
    );
  }

  // ================================
  // ERREUR
  // ================================

  if (error) {
    return (
      <div className="payment-success">

        <div className="success-card">

          <div className="success-icon">
            ❌
          </div>

          <h1>
            Erreur de paiement
          </h1>

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

  // ================================
  // COMMANDE INTROUVABLE
  // ================================

  if (!order) {
    return (
      <div className="payment-success">

        <div className="success-card">

          <div className="success-icon">
            ❌
          </div>

          <h2>
            Commande introuvable
          </h2>

          <p>
            Nous n'avons pas trouvé la commande associée
            à ce paiement.
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

  // ================================
  // STATUT DU PAIEMENT
  // ================================

  const paiementReussi =
    paymentStatus === "completed" ||
    order.statutPaiement === "Payé";

  const paiementEnAttente =
    paymentStatus === "pending" &&
    order.statutPaiement !== "Payé";

  // ================================
  // PAIEMENT RÉUSSI
  // ================================

  if (paiementReussi) {
    return (
      <div className="payment-success">

        <div className="success-card">

          <div className="success-icon">
            ✅
          </div>

          <h1>
            Paiement réussi
          </h1>

          <p>
            Merci pour votre achat !
          </p>

          <p>
            Votre paiement a été confirmé par PayDunya.
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
            <strong>Statut du paiement :</strong>{" "}
            <span className="payment-paid">
              Payé
            </span>
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

  // ================================
  // PAIEMENT EN ATTENTE
  // ================================

  if (paiementEnAttente) {
    return (
      <div className="payment-success">

        <div className="success-card">

          <div className="success-icon">
            ⏳
          </div>

          <h1>
            Paiement en attente
          </h1>

          <p>
            Votre paiement n'est pas encore confirmé.
          </p>

          <p>
            Vous pouvez consulter vos commandes pour
            vérifier son évolution.
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
            <strong>Référence :</strong>{" "}
            {order.referencePaiement || "Non disponible"}
          </p>

          <p>
            <strong>Statut :</strong>{" "}
            {order.statutPaiement}
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

  // ================================
  // AUTRE STATUT
  // ================================

  return (
    <div className="payment-success">

      <div className="success-card">

        <div className="success-icon">
          ⚠️
        </div>

        <h1>
          Statut du paiement
        </h1>

        <p>
          Le statut actuel de votre paiement est :
        </p>

        <p>
          <strong>
            {order.statutPaiement || paymentStatus || "Inconnu"}
          </strong>
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