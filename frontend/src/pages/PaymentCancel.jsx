import { Link } from "react-router-dom";
import "../css/paymentCancel.css";

function PaymentCancel() {
  return (
    <div className="payment-cancel">

      <div className="cancel-card">

        <div className="cancel-icon">
          ❌
        </div>

        <h1>Paiement annulé</h1>

        <p>
          Votre paiement PayDunya a été annulé ou interrompu.
        </p>

        <p className="cancel-info">
          Aucun montant ne devrait être débité si la transaction
          n'a pas été finalisée.
        </p>

        <div className="cancel-buttons">

          <Link to="/my-orders" className="orders-btn">
            Mes commandes
          </Link>

          <Link to="/" className="home-btn">
            Retour à l'accueil
          </Link>

        </div>

      </div>

    </div>
  );
}

export default PaymentCancel;