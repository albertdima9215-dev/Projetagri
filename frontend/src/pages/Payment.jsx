import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaLock,
  FaCreditCard,
  FaTruck,
  FaShieldAlt,
  FaReceipt,
} from "react-icons/fa";

import api from "../services/api";

import {
  formatUnite,
  getOrderQuantityLabel,
} from "../utils/productFormatters";

import "../css/payment.css";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paydunya");

  // ======================================================
  // COMMANDE INTROUVABLE
  // ======================================================

  if (!order) {
    return (
      <div className="payment-page">
        <div className="payment-empty">
          <div className="payment-empty-icon">
            <FaReceipt />
          </div>

          <h2>Commande introuvable</h2>

          <p>
            Impossible de récupérer les informations de cette
            commande. Elle a peut-être été supprimée ou la session
            de paiement a expiré.
          </p>

          <button
            type="button"
            className="payment-back-btn"
            onClick={() => navigate("/my-orders")}
          >
            <FaArrowLeft />
            Retour à mes commandes
          </button>
        </div>
      </div>
    );
  }

  // ======================================================
  // DONNÉES DE LA COMMANDE
  // ======================================================

  const productName =
    order.produit?.nom || "Produit agricole";

  const productImage =
    order.produit?.image ||
    order.produit?.images?.[0] ||
    "";

  const quantityLabel = getOrderQuantityLabel(order);

  const unitPrice = Number(order.prixUnitaire || 0);

  const totalAmount = Number(order.montant || 0);

  // ======================================================
  // LIBELLÉ DU PRIX
  // ======================================================

  const getPriceLabel = () => {
    const prix = unitPrice.toLocaleString("fr-FR");

    // Vente par lot
    if (order.typeVente === "lot") {
      const quantiteLot = Number(
        order.quantiteParLot || 0
      );

      if (quantiteLot > 0) {
        const unite = formatUnite(
          order.unite || "piece"
        );

        let uniteLot = unite;

        if (quantiteLot > 1) {
          if (unite === "pièce") {
            uniteLot = "pièces";
          } else if (
            !unite.endsWith("s") &&
            !["kg", "5 kg", "10 kg", "25 kg", "50 kg", "100 kg", "1 tonne"].includes(
              unite
            )
          ) {
            uniteLot = `${unite}s`;
          }
        }

        return `${prix} FCFA / lot de ${quantiteLot} ${uniteLot}`;
      }

      return `${prix} FCFA / lot`;
    }

    // Vente au poids
    if (order.typeVente === "poids") {
      return `${prix} FCFA / ${formatUnite(
        order.unite || "1kg"
      )}`;
    }

    // Vente à l'unité
    return `${prix} FCFA / ${formatUnite(
      order.unite || "piece"
    )}`;
  };

  // ======================================================
  // PAIEMENT PAYDUNYA
  // ======================================================

  const payWithPayDunya = async () => {
    if (loading) return;

    if (paymentMethod !== "paydunya") {
      alert(
        "Le paiement à la livraison sera disponible prochainement."
      );
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert(
          "Votre session a expiré. Veuillez vous reconnecter."
        );

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

      console.log(
        "Réponse création paiement :",
        res.data
      );

      const paymentUrl = res.data?.url;

      if (!paymentUrl) {
        throw new Error(
          "PayDunya n'a pas retourné d'URL de paiement."
        );
      }

      console.log(
        "Redirection vers PayDunya :",
        paymentUrl
      );

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

  // ======================================================
  // RETOUR
  // ======================================================

  const handleBack = () => {
    navigate("/my-orders");
  };

  // ======================================================
  // AFFICHAGE
  // ======================================================

  return (
    <div className="payment-page">

      {/* HEADER */}
      <div className="payment-header">

        <button
          type="button"
          className="payment-back"
          onClick={handleBack}
          disabled={loading}
        >
          <FaArrowLeft />
          <span>Mes commandes</span>
        </button>

        <div className="payment-secure">
          <FaLock />
          <span>Paiement sécurisé</span>
        </div>

      </div>

      {/* CONTENU */}
      <main className="payment-content">

        {/* TITRE */}
        <div className="payment-title">

          <div>
            <span className="payment-eyebrow">
              FINALISATION DE LA COMMANDE
            </span>

            <h1>
              Effectuer le paiement
            </h1>

            <p>
              Vérifiez les informations de votre commande
              avant de procéder au paiement.
            </p>
          </div>

        </div>

        <div className="payment-grid">

          {/* ==================================================
              COLONNE GAUCHE
          ================================================== */}

          <div className="payment-main">

            {/* PRODUIT */}
            <section className="payment-card product-card">

              <div className="card-heading">
                <div className="heading-icon">
                  <FaReceipt />
                </div>

                <div>
                  <h2>
                    Résumé de la commande
                  </h2>

                  <p>
                    Commande #{order._id}
                  </p>
                </div>
              </div>

              <div className="product-summary">

                <div className="product-image-wrapper">

                  {productImage ? (
                    <img
                      src={productImage}
                      alt={productName}
                      className="product-image"
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      <FaReceipt />
                    </div>
                  )}

                </div>

                <div className="product-info">

                  <h3>
                    {productName}
                  </h3>

                  <div className="product-details">

                    <div className="detail-item">
                      <span>Quantité</span>
                      <strong>
                        {quantityLabel}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>Prix unitaire</span>
                      <strong>
                        {getPriceLabel()}
                      </strong>
                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* MÉTHODE DE PAIEMENT */}
            <section className="payment-card">

              <div className="card-heading">

                <div className="heading-icon">
                  <FaCreditCard />
                </div>

                <div>
                  <h2>
                    Méthode de paiement
                  </h2>

                  <p>
                    Choisissez votre mode de paiement
                  </p>
                </div>

              </div>

              <div className="payment-method-list">

                {/* PAYDUNYA */}
                <button
                  type="button"
                  className={`payment-method ${
                    paymentMethod === "paydunya"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setPaymentMethod("paydunya")
                  }
                  disabled={loading}
                >

                  <div className="method-icon paydunya-icon">
                    🟧
                  </div>

                  <div className="method-content">

                    <div className="method-title">

                      <h3>
                        PayDunya
                      </h3>

                      {paymentMethod ===
                        "paydunya" && (
                        <FaCheckCircle className="method-check" />
                      )}

                    </div>

                    <p>
                      Orange Money, Wave, cartes
                      bancaires et autres moyens
                      disponibles via PayDunya.
                    </p>

                  </div>

                </button>

                {/* PAIEMENT À LA LIVRAISON */}
                <button
                  type="button"
                  className={`payment-method ${
                    paymentMethod === "delivery"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setPaymentMethod("delivery")
                  }
                  disabled={loading}
                >

                  <div className="method-icon">
                    <FaTruck />
                  </div>

                  <div className="method-content">

                    <div className="method-title">

                      <h3>
                        Paiement à la livraison
                      </h3>

                      {paymentMethod ===
                        "delivery" && (
                        <FaCheckCircle className="method-check" />
                      )}

                    </div>

                    <p>
                      Cette option sera disponible
                      prochainement.
                    </p>

                  </div>

                </button>

              </div>

            </section>

            {/* SÉCURITÉ */}
            <div className="payment-security">

              <div className="security-item">
                <FaShieldAlt />
                <div>
                  <strong>
                    Paiement sécurisé
                  </strong>

                  <span>
                    Vos informations de paiement
                    sont protégées.
                  </span>
                </div>
              </div>

              <div className="security-item">
                <FaLock />
                <div>
                  <strong>
                    Transaction protégée
                  </strong>

                  <span>
                    Vous serez redirigé vers
                    PayDunya pour effectuer le paiement.
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* ==================================================
              COLONNE DROITE : TOTAL
          ================================================== */}

          <aside className="payment-sidebar">

            <section className="payment-card total-card">

              <div className="total-header">

                <h2>
                  Total à payer
                </h2>

                <span className="total-status">
                  {order.statutPaiement ||
                    "En attente"}
                </span>

              </div>

              <div className="price-block">

                <span>
                  Montant total
                </span>

                <strong>
                  {totalAmount.toLocaleString(
                    "fr-FR"
                  )}{" "}
                  <small>FCFA</small>
                </strong>

              </div>

              <div className="price-separator" />

              <div className="price-line">

                <span>
                  Produit
                </span>

                <strong>
                  {totalAmount.toLocaleString(
                    "fr-FR"
                  )} FCFA
                </strong>

              </div>

              <div className="price-line">

                <span>
                  Livraison
                </span>

                <strong className="free">
                  À confirmer
                </strong>

              </div>

              <div className="price-separator" />

              <div className="total-final">

                <span>
                  Total
                </span>

                <strong>
                  {totalAmount.toLocaleString(
                    "fr-FR"
                  )} FCFA
                </strong>

              </div>

              <button
                type="button"
                className="pay-btn"
                onClick={payWithPayDunya}
                disabled={
                  loading ||
                  paymentMethod !== "paydunya"
                }
              >

                {loading ? (
                  <>
                    <span className="payment-spinner" />
                    Création du paiement...
                  </>
                ) : (
                  <>
                    <FaLock />
                    Payer maintenant
                  </>
                )}

              </button>

              <p className="payment-note">
                En cliquant sur « Payer maintenant »,
                vous serez redirigé vers PayDunya
                pour terminer votre paiement.
              </p>

            </section>

            {/* INFOS COMMANDE */}
            <section className="payment-card order-info-card">

              <h3>
                Informations
              </h3>

              <div className="order-info-row">

                <span>
                  Référence
                </span>

                <strong>
                  #{String(order._id).slice(-8)}
                </strong>

              </div>

              <div className="order-info-row">

                <span>
                  Type de vente
                </span>

                <strong>
                  {order.typeVente === "lot"
                    ? "Par lot"
                    : order.typeVente === "poids"
                    ? "Au poids"
                    : "À l'unité"}
                </strong>

              </div>

              <div className="order-info-row">

                <span>
                  Statut
                </span>

                <strong className="order-status">
                  {order.statut ||
                    "En attente"}
                </strong>

              </div>

            </section>

          </aside>

        </div>

      </main>

    </div>
  );
}

export default Payment;