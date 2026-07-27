import { Link, useLocation } from "react-router-dom";
import "../css/paymentSuccess.css";

function PaymentSuccess() {
  const location = useLocation();

  const { order } = location.state || {};

  if (!order) {
    return (
      <div className="payment-success">
        <h2>Aucune information de paiement disponible.</h2>

        <Link to="/">
          Retour à l'accueil
        </Link>
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
          <strong>Produit :</strong> {order.produit.nom}
        </p>

        <p>
          <strong>Montant :</strong> {order.montant} FCFA
        </p>

        <p>
          <strong>Méthode :</strong> {order.methodePaiement}
        </p>

        <p>
          <strong>Référence :</strong> {order.referencePaiement}
        </p>

        <p>
          <strong>Statut :</strong> {order.paiement}
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