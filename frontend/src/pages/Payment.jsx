import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/payment.css";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  const [loading, setLoading] = useState(false);

  if (!order) {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <h2>Commande introuvable</h2>

          <p>
            Impossible de récupérer les informations de la commande.
          </p>

          <button
            className="pay-btn"
            onClick={() => navigate("/my-orders")}
          >
            Retour à mes commandes
          </button>
        </div>
      </div>
    );
  }

  const payWithPayDunya = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        navigate("/login");
        return;
      }

      console.log(
        "Création du paiement pour la commande :",
        order._id
      );

      const res = await api.post(
        "/payments/create",
        {
          commandeId: order._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Réponse création paiement :", res.data);

      const paymentUrl = res.data?.url;

      if (!paymentUrl) {
        throw new Error(
          "PayDunya n'a pas retourné d'URL de paiement."
        );
      }

      console.log("Redirection vers PayDunya :", paymentUrl);

      window.location.assign(paymentUrl);

    } catch (error) {
      console.error(
        "Erreur paiement :",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la création du paiement."
      );

      setLoading(false);
    }
  };

  return (
    <div className="payment-container">

      <div className="payment-card">

        <h1>Paiement</h1>

        <h2>{order.produit?.nom}</h2>

        <p>
          Quantité :
          <strong> {order.quantite}</strong>
        </p>

        <p>
          Total :
          <strong> {order.montant} FCFA</strong>
        </p>

        <div className="payment-summary">

          <p>
            <strong>Commande :</strong>
            <br />
            {order._id}
          </p>

          <p>
            <strong>Statut :</strong>
            <br />
            {order.statutPaiement || "En attente"}
          </p>

        </div>

        <label>Méthode de paiement</label>

        <div className="payment-methods">

          <div className="payment-option active">
            🟧
            <h3>PayDunya</h3>

            <p>
              Orange Money, Wave, cartes et autres moyens
            </p>
          </div>

          <div
            className="payment-option"
            onClick={() => {
              alert(
                "Le paiement à la livraison sera disponible prochainement."
              );
            }}
          >
            🚚

            <h3>Paiement à la livraison</h3>

            <p>
              Payer lorsque la commande est livrée
            </p>
          </div>

        </div>

        <button
          className="pay-btn"
          onClick={payWithPayDunya}
          disabled={loading}
        >
          {loading
            ? "Création du paiement..."
            : `Payer ${order.montant} FCFA avec PayDunya`}
        </button>

      </div>

    </div>
  );
}

export default Payment;