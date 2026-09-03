import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/orders.css";
import { Link } from "react-router-dom";

// Icons
import {
  FaArrowDown,
  FaCar,
  FaRegCalendarAlt,
  FaCheckSquare,
} from "react-icons/fa";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [reviewData, setReviewData] = useState({
    note: 5,
    commentaire: "",
  });

  useEffect(() => {
    fetchOrders();

    // Vérifier si un paiement vient d'être effectué
    const paymentUpdated = localStorage.getItem("paymentUpdated");

    if (paymentUpdated) {
      try {
        const data = JSON.parse(paymentUpdated);

        const isRecent =
          Date.now() - data.timestamp < 5 * 60 * 1000;

        if (isRecent) {
          console.log(
            "Paiement récemment confirmé pour :",
            data.orderId
          );

          fetchOrders();

          localStorage.removeItem("paymentUpdated");
        } else {
          localStorage.removeItem("paymentUpdated");
        }
      } catch (error) {
        console.log("Erreur lecture paymentUpdated :", error);

        localStorage.removeItem("paymentUpdated");
      }
    }

    // Actualisation automatique toutes les 10 secondes
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    // Actualiser lorsque l'utilisateur revient sur la page
    const handleFocus = () => {
      console.log(
        "Retour sur la page : actualisation des commandes"
      );

      fetchOrders();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // ==================================================
  // RÉCUPÉRER LES COMMANDES
  // ==================================================

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("COMMANDES =", res.data);

      setOrders(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ==================================================
  // AFFICHAGE DE LA QUANTITÉ
  // ==================================================

  const getQuantityLabel = (order) => {
    // Vente par lot
    if (order.typeVente === "lot") {
      return `${order.quantite} lot${
        order.quantite > 1 ? "s" : ""
      }`;
    }

    // Vente au poids
    if (order.typeVente === "poids") {
      return `${order.quantite} × ${order.unite || ""}`;
    }

    // Vente à l'unité
    if (order.typeVente === "unite") {
      return `${order.quantite} × ${order.unite || ""}`;
    }

    // Compatibilité avec les anciennes commandes
    return order.quantite;
  };

  // ==================================================
  // TYPE DE VENTE
  // ==================================================

  const getSaleTypeLabel = (order) => {
    if (order.typeVente === "poids") {
      return "Au poids";
    }

    if (order.typeVente === "unite") {
      return "À l'unité";
    }

    if (order.typeVente === "lot") {
      return "Par lot";
    }

    return null;
  };

  // ==================================================
  // AVIS
  // ==================================================

  const openReviewModal = (order) => {
    setSelectedOrder(order);

    setReviewData({
      note: 5,
      commentaire: "",
    });

    setShowReviewModal(true);
  };

  const submitReview = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/reviews",
        {
          produit: selectedOrder.produit._id,
          vendeurId: selectedOrder.vendeur._id,
          commande: selectedOrder._id,
          note: reviewData.note,
          commentaire: reviewData.commentaire,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Merci pour votre avis.");

      setShowReviewModal(false);

      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur");
    }
  };

  // ==================================================
  // FACTURE
  // ==================================================

  const downloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(
        `/orders/${orderId}/invoice`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        `facture-${orderId}.pdf`
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(
        "Erreur lors du téléchargement de la facture"
      );

      console.log(error);
    }
  };

  // ==================================================
  // ANNULER UNE COMMANDE
  // ==================================================

  const cancelOrder = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/orders/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur");
    }
  };

  // ==================================================
  // ARCHIVER
  // ==================================================

  const archiveOrder = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/orders/${id}/archive`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Retirer immédiatement la commande de la liste
      setOrders((prev) =>
        prev.filter((o) => o._id !== id)
      );

      alert("Commande archivée");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur");
    }
  };

  // ==================================================
  // AFFICHAGE
  // ==================================================

  return (
    <div className="orders-container">

      <h1>Mes commandes</h1>

      <Link
        to="/archives"
        className="archive-link"
      >
        Voir les archives
      </Link>

      {orders.length === 0 ? (
        <p>Aucune commande.</p>
      ) : (
        orders
          .filter(
            (order) =>
              order.produit && order.vendeur
          )
          .map((order) => (
            <div
              className="order-card"
              key={order._id}
            >

              {/* =========================
                  IMAGE
              ========================= */}

              <img
                src={
                  order.produit.images?.[0] ||
                  order.produit.image
                }
                alt={order.produit.nom}
              />

              <div className="order-card-infos">

                {/* PRODUIT */}

                <h3>
                  {order.produit?.nom}
                </h3>

                {/* TYPE DE VENTE */}

                {getSaleTypeLabel(order) && (
                  <p>
                    <strong>
                      Type de vente :
                    </strong>{" "}
                    {getSaleTypeLabel(order)}
                  </p>
                )}

                {/* QUANTITÉ */}

                <p>
                  <strong>
                    Quantité commandée :
                  </strong>{" "}
                  {getQuantityLabel(order)}
                </p>

                {/* UNITÉ */}

                {order.unite && (
                  <p>
                    <strong>Unité :</strong>{" "}
                    {order.unite}
                  </p>
                )}

                {/* COMPOSITION DU LOT */}

                {order.typeVente === "lot" &&
                  order.quantiteParLot && (
                    <p>
                      <strong>
                        Composition :
                      </strong>{" "}
                      {order.quantiteParLot} unités
                      {" / lot"}
                    </p>
                  )}

                {/* PRIX UNITAIRE */}

                {order.prixUnitaire !== undefined && (
                  <p>
                    <strong>
                      Prix unitaire :
                    </strong>{" "}
                    {Number(
                      order.prixUnitaire
                    ).toLocaleString("fr-FR")}{" "}
                    FCFA
                    {order.unite &&
                      ` / ${order.unite}`}
                  </p>
                )}

                {/* MONTANT TOTAL */}

                <p className="order-total">
                  <strong>
                    Montant total :
                  </strong>{" "}
                  {Number(
                    order.montant
                  ).toLocaleString("fr-FR")}{" "}
                  FCFA
                </p>

                {/* DATE */}

                <p>
                  <strong>
                    Commandée le :
                  </strong>{" "}
                  {new Date(
                    order.createdAt
                  ).toLocaleDateString("fr-FR")}
                </p>

                {/* STATUT */}

                <p
                  className={`status ${order.statut}`}
                >
                  {order.statut}
                </p>

                {/* PAIEMENT */}

                <p
                  className={`payment-status ${
                    order.statutPaiement === "Payé"
                      ? "payment-paid"
                      : "payment-pending"
                  }`}
                >
                  💳 Paiement :{" "}
                  <strong>
                    {order.statutPaiement === "Payé"
                      ? "Payé"
                      : "En attente"}
                  </strong>
                </p>

                {/* VENDEUR */}

                <p>
                  Vendeur :{" "}
                  {order.vendeur?.nom ||
                    "Vendeur indisponible"}
                </p>

                {/* NUMÉRO DE SUIVI */}

                {order.numeroSuivi && (
                  <p>
                    <FaCar /> Suivi :{" "}
                    <strong>
                      {order.numeroSuivi}
                    </strong>
                  </p>
                )}

                {/* DATE EXPÉDITION */}

                {order.dateExpedition && (
                  <p>
                    <FaRegCalendarAlt /> Expédiée le :{" "}
                    {new Date(
                      order.dateExpedition
                    ).toLocaleDateString("fr-FR")}
                  </p>
                )}

                {/* DATE LIVRAISON */}

                {order.dateLivraison && (
                  <p>
                    <FaCheckSquare /> Livrée le :{" "}
                    {new Date(
                      order.dateLivraison
                    ).toLocaleDateString("fr-FR")}
                  </p>
                )}

                {/* =========================
                    PROGRESSION
                ========================= */}

                <div className="order-progress">

                  <div
                    className={`step ${
                      [
                        "En attente",
                        "Confirmée",
                        "Expédiée",
                        "Livrée",
                      ].includes(order.statut)
                        ? "active"
                        : ""
                    }`}
                  >
                    <span>1</span>
                    <p>Commande</p>
                  </div>

                  <div
                    className={`step ${
                      [
                        "Confirmée",
                        "Expédiée",
                        "Livrée",
                      ].includes(order.statut)
                        ? "active"
                        : ""
                    }`}
                  >
                    <span>2</span>
                    <p>Confirmée</p>
                  </div>

                  <div
                    className={`step ${
                      [
                        "Expédiée",
                        "Livrée",
                      ].includes(order.statut)
                        ? "active"
                        : ""
                    }`}
                  >
                    <span>3</span>
                    <p>Expédiée</p>
                  </div>

                  <div
                    className={`step ${
                      order.statut ===
                      "Livrée"
                        ? "active"
                        : ""
                    }`}
                  >
                    <span>4</span>
                    <p>Livrée</p>
                  </div>

                </div>

              </div>

              {/* =========================
                  BOUTONS
              ========================= */}

              <div className="order-btns">

                {/* PRODUIT */}

                <Link
                  to={`/products/${order.produit._id}`}
                >
                  Voir le produit
                </Link>

                {/* PAIEMENT */}

                {order.methodePaiement ===
                  "PayDunya" &&
                  order.statutPaiement !== "Payé" &&
                  order.statut !== "Annulée" && (
                    <Link
                      to="/payment"
                      state={{ order }}
                      className="pay-order-btn"
                    >
                      Payer maintenant
                    </Link>
                  )}

                {/* WHATSAPP */}

                <a
                  href={`https://wa.me/226${
                    order.vendeur?.telephone || ""
                  }`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Contacter le vendeur
                </a>

                {/* FACTURE */}

                <button
                  className="downloadBtn"
                  onClick={() =>
                    downloadInvoice(order._id)
                  }
                >
                  <FaArrowDown /> Facture
                </button>

                {/* AVIS */}

                {order.statut === "Livrée" &&
                  !order.avisLaisse && (
                    <button
                      className="review-btn"
                      onClick={() =>
                        openReviewModal(order)
                      }
                    >
                      ⭐ Laisser un avis
                    </button>
                  )}

                {/* ARCHIVER */}

                {[
                  "Livrée",
                  "Annulée",
                ].includes(order.statut) && (
                  <button
                    className="archive-btn"
                    onClick={() =>
                      archiveOrder(order._id)
                    }
                  >
                    Archiver
                  </button>
                )}

                {/* ANNULER */}

                {order.statut ===
                  "En attente" && (
                  <button
                    className="cancel-order-btn"
                    onClick={() =>
                      cancelOrder(order._id)
                    }
                  >
                    Annuler la commande
                  </button>
                )}

              </div>
            </div>
          ))
      )}

      {/* =========================
          MODAL AVIS
      ========================= */}

      {showReviewModal && (
        <div className="modal-overlay">

          <div className="review-modal">

            <h2>Laisser un avis</h2>

            <label>Note</label>

            <div className="rating-stars">

              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <span
                    key={star}
                    className={
                      star <= reviewData.note
                        ? "star active"
                        : "star"
                    }
                    onClick={() =>
                      setReviewData({
                        ...reviewData,
                        note: star,
                      })
                    }
                  >
                    ★
                  </span>
                )
              )}

            </div>

            <textarea
              placeholder="Votre commentaire..."
              value={
                reviewData.commentaire
              }
              onChange={(e) =>
                setReviewData({
                  ...reviewData,
                  commentaire:
                    e.target.value,
                })
              }
            />

            <div className="modal-buttons">

              <button
                onClick={() =>
                  setShowReviewModal(false)
                }
              >
                Annuler
              </button>

              <button
                onClick={submitReview}
              >
                Envoyer
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}

export default MyOrders;