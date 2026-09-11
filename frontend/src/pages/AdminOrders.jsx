import { useEffect, useMemo, useState } from "react";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaMoneyBillWave,
  FaSearch,
  FaEdit,
  FaTimes,
  FaUser,
  FaStore,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

import api from "../services/api";
import {
  formatUnite,
  getSaleTypeLabel,
  getSelectedQuantityLabel,
} from "../utils/productFormatters";

import "../css/adminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");

  /* =====================================================
     CHARGEMENT DES COMMANDES
  ===================================================== */

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data || []);
    } catch (err) {
      console.error("Erreur récupération commandes :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de récupérer les commandes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =====================================================
     HELPERS
  ===================================================== */

  const getStatusClass = (status) => {
    switch (status) {
      case "En attente":
        return "status-pending";

      case "Confirmée":
        return "status-confirmed";

      case "Payée":
        return "status-paid";

      case "Expédiée":
        return "status-shipped";

      case "Livrée":
        return "status-delivered";

      case "Annulée":
        return "status-cancelled";

      default:
        return "status-pending";
    }
  };

  const getPaymentClass = (status) => {
    switch (status) {
      case "Payé":
      case "Réussi":
        return "payment-paid";

      case "Échoué":
      case "Echoué":
        return "payment-failed";

      default:
        return "payment-pending";
    }
  };

  const getProductImage = (product) => {
    if (!product) return "";

    if (product.images?.length > 0) {
      return product.images[0];
    }

    return product.image || "";
  };

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString("fr-FR");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderQuantityLabel = (order) => {
    if (!order) return "-";

    /*
     * On privilégie les données sauvegardées dans la commande.
     * Cela évite qu'une modification ultérieure du produit
     * change l'affichage d'une ancienne commande.
     */

    const typeVente = order.typeVente;
    const unite = order.unite;
    const quantite = Number(order.quantite || 0);

    if (typeVente === "lot") {
      return `${quantite.toLocaleString("fr-FR")} ${
        quantite > 1 ? "lots" : "lot"
      }`;
    }

    if (typeVente === "poids") {
      return `${quantite.toLocaleString("fr-FR")} × ${formatUnite(
        unite || "1kg"
      )}`;
    }

    return `${quantite.toLocaleString("fr-FR")} × ${formatUnite(
      unite || "piece"
    )}`;
  };

  const getOrderSaleTypeLabel = (order) => {
    if (!order) return "-";

    switch (order.typeVente) {
      case "poids":
        return "Au poids";

      case "unite":
        if (order.unite === "piece") {
          return "À l'unité";
        }

        return `Par ${formatUnite(order.unite)}`;

      case "lot":
        return "Par lot";

      default:
        return getSaleTypeLabel(order.produit) || "-";
    }
  };

  const getLotComposition = (order) => {
    if (!order || order.typeVente !== "lot") {
      return null;
    }

    const quantiteParLot = Number(order.quantiteParLot || 0);

    if (!quantiteParLot) {
      return null;
    }

    return `${quantiteParLot} ${formatUnite(order.unite || "piece")}`;
  };

  /* =====================================================
     RECHERCHE + FILTRE
  ===================================================== */

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return orders.filter((order) => {
      const productName = order.produit?.nom || "";
      const buyerName = order.acheteur?.nom || "";
      const sellerName = order.vendeur?.nom || "";
      const orderId = order._id || order.id || "";

      const matchesSearch =
        !searchValue ||
        productName.toLowerCase().includes(searchValue) ||
        buyerName.toLowerCase().includes(searchValue) ||
        sellerName.toLowerCase().includes(searchValue) ||
        orderId.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || order.statut === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  /* =====================================================
     STATISTIQUES
  ===================================================== */

  const statistics = useMemo(() => {
    const total = orders.length;

    const pending = orders.filter(
      (order) => order.statut === "En attente"
    ).length;

    const shipped = orders.filter(
      (order) => order.statut === "Expédiée"
    ).length;

    const delivered = orders.filter(
      (order) => order.statut === "Livrée"
    ).length;

    const revenue = orders
      .filter((order) => order.statut !== "Annulée")
      .reduce((totalAmount, order) => {
        return totalAmount + Number(order.montant || 0);
      }, 0);

    return {
      total,
      pending,
      shipped,
      delivered,
      revenue,
    };
  }, [orders]);

  /* =====================================================
     OUVRIR MODAL
  ===================================================== */

  const openModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.statut || "En attente");
    setShowModal(true);
  };

  /* =====================================================
     FERMER MODAL
  ===================================================== */

  const closeModal = () => {
    if (updating) return;

    setShowModal(false);
    setSelectedOrder(null);
    setNewStatus("");
  };

  /* =====================================================
     MODIFICATION DU STATUT
  ===================================================== */

  const updateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setUpdating(true);
      setError("");

      const token = localStorage.getItem("token");

      const orderId = selectedOrder._id || selectedOrder.id;

      const response = await api.put(
        `/admin/orders/${orderId}/status`,
        {
          statut: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedOrder = response.data?.order;

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          const currentId = order._id || order.id;

          if (currentId === orderId) {
            return updatedOrder || {
              ...order,
              statut: newStatus,
            };
          }

          return order;
        })
      );

      closeModal();
    } catch (err) {
      console.error("Erreur modification statut :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de modifier le statut de la commande."
      );
    } finally {
      setUpdating(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="admin-orders">
        <div className="orders-loading">
          <div className="orders-spinner"></div>
          <p>Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="admin-orders">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-orders-header">
        <div>
          <h1>
            Gestion des commandes
            <span className="orders-count">{orders.length}</span>
          </h1>

          <p>
            Consultez et gérez toutes les commandes de la plateforme.
          </p>
        </div>
      </div>

      {/* =================================================
          ERREUR
      ================================================= */}

      {error && (
        <div className="orders-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Fermer"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* =================================================
          STATISTIQUES
      ================================================= */}

      <div className="orders-stats">

        <div className="order-stat-card">
          <div className="order-stat-icon">
            <FaBoxOpen />
          </div>

          <div>
            <h3>{statistics.total}</h3>
            <p>Total commandes</p>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="order-stat-icon">
            <FaClock />
          </div>

          <div>
            <h3>{statistics.pending}</h3>
            <p>En attente</p>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="order-stat-icon">
            <FaTruck />
          </div>

          <div>
            <h3>{statistics.shipped}</h3>
            <p>Expédiées</p>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="order-stat-icon">
            <FaMoneyBillWave />
          </div>

          <div>
            <h3>
              {formatPrice(statistics.revenue)}
              <small> FCFA</small>
            </h3>
            <p>Chiffre d'affaires</p>
          </div>
        </div>

      </div>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="orders-toolbar">

        <div className="orders-search">
          <FaSearch className="orders-search-icon" />

          <input
            type="text"
            placeholder="Rechercher une commande, un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="orders-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="En attente">En attente</option>
          <option value="Confirmée">Confirmée</option>
          <option value="Payée">Payée</option>
          <option value="Expédiée">Expédiée</option>
          <option value="Livrée">Livrée</option>
          <option value="Annulée">Annulée</option>
        </select>

      </div>

      {/* =================================================
          RESULTAT
      ================================================= */}

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <FaBoxOpen className="no-orders-icon" />

          <h3>Aucune commande trouvée</h3>

          <p>
            {search || statusFilter !== "all"
              ? "Aucune commande ne correspond à vos critères."
              : "Aucune commande n'est disponible pour le moment."}
          </p>
        </div>
      ) : (
        <div className="orders-table-wrapper">

          <table className="orders-table">

            <thead>
              <tr>
                <th>Produit</th>
                <th>Acheteur</th>
                <th>Vendeur</th>
                <th>Commande</th>
                <th>Montant</th>
                <th>Paiement</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredOrders.map((order) => {
                const orderId = order._id || order.id;

                const product = order.produit;

                const image = getProductImage(product);

                const lotComposition = getLotComposition(order);

                return (
                  <tr key={orderId}>

                    {/* PRODUIT */}

                    <td>
                      <div className="order-product">

                        {image ? (
                          <img
                            src={image}
                            alt={product?.nom || "Produit"}
                          />
                        ) : (
                          <div className="order-product-placeholder">
                            <FaBoxOpen />
                          </div>
                        )}

                        <div className="order-product-info">

                          <strong>
                            {product?.nom || "Produit supprimé"}
                          </strong>

                          <span>
                            {product?.categorie || "—"}
                          </span>

                        </div>

                      </div>
                    </td>

                    {/* ACHETEUR */}

                    <td>
                      <div className="order-person">

                        <div className="person-name">
                          <FaUser />

                          <strong>
                            {order.acheteur?.nom || "Inconnu"}
                          </strong>
                        </div>

                        {order.acheteur?.telephone && (
                          <span>
                            <FaPhone />
                            {order.acheteur.telephone}
                          </span>
                        )}

                      </div>
                    </td>

                    {/* VENDEUR */}

                    <td>
                      <div className="order-person">

                        <div className="person-name">
                          <FaStore />

                          <strong>
                            {order.vendeur?.nom || "Inconnu"}
                          </strong>
                        </div>

                        {order.vendeur?.telephone && (
                          <span>
                            <FaPhone />
                            {order.vendeur.telephone}
                          </span>
                        )}

                      </div>
                    </td>

                    {/* COMMANDE */}

                    <td>
                      <div className="order-details">

                        <span className="order-type">
                          {getOrderSaleTypeLabel(order)}
                        </span>

                        <p>
                          <strong>
                            {getOrderQuantityLabel(order)}
                          </strong>
                        </p>

                        {lotComposition && (
                          <p>
                            Lot : {lotComposition}
                          </p>
                        )}

                        <p>
                          {formatDate(order.createdAt)}
                        </p>

                      </div>
                    </td>

                    {/* MONTANT */}

                    <td>
                      <div className="order-amount">

                        <strong>
                          {formatPrice(order.montant)} FCFA
                        </strong>

                        <span className="order-unit-price">
                          {formatPrice(order.prixUnitaire)} FCFA / unité
                        </span>

                      </div>
                    </td>

                    {/* PAIEMENT */}

                    <td>
                      <div className="payment-info">

                        <span className="payment-method">
                          {order.methodePaiement ||
                            order.modePaiement ||
                            "Non précisé"}
                        </span>

                        <span
                          className={`payment-status ${getPaymentClass(
                            order.statutPaiement
                          )}`}
                        >
                          {order.statutPaiement || "En attente"}
                        </span>

                      </div>
                    </td>

                    {/* STATUT */}

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          order.statut
                        )}`}
                      >
                        {order.statut || "En attente"}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td>
                      <button
                        type="button"
                        className="order-action-btn"
                        onClick={() => openModal(order)}
                      >
                        <FaEdit />
                        Modifier
                      </button>
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>
      )}

      {/* =================================================
          MODAL
      ================================================= */}

      {showModal && selectedOrder && (
        <div
          className="order-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >

          <div className="order-modal">

            {/* HEADER */}

            <div className="order-modal-header">

              <div>
                <h2>Modifier la commande</h2>

                <span className="modal-order-id">
                  Commande #
                  {(selectedOrder._id || selectedOrder.id || "")
                    .slice(-8)
                    .toUpperCase()}
                </span>
              </div>

              <button
                type="button"
                className="order-modal-close"
                onClick={closeModal}
                disabled={updating}
                aria-label="Fermer"
              >
                <FaTimes />
              </button>

            </div>

            {/* BODY */}

            <div className="order-modal-body">

              {/* PRODUIT */}

              <div className="modal-product">

                {getProductImage(selectedOrder.produit) ? (
                  <img
                    src={getProductImage(selectedOrder.produit)}
                    alt={selectedOrder.produit?.nom || "Produit"}
                  />
                ) : (
                  <div className="modal-product-placeholder">
                    <FaBoxOpen />
                  </div>
                )}

                <div>

                  <h3>
                    {selectedOrder.produit?.nom ||
                      "Produit supprimé"}
                  </h3>

                  <p>
                    {selectedOrder.produit?.categorie || "—"}
                  </p>

                </div>

              </div>

              {/* INFORMATIONS */}

              <div className="order-modal-info">

                <div className="modal-info-item">
                  <span>Type de vente</span>

                  <strong>
                    {getOrderSaleTypeLabel(selectedOrder)}
                  </strong>
                </div>

                <div className="modal-info-item">
                  <span>Quantité</span>

                  <strong>
                    {getOrderQuantityLabel(selectedOrder)}
                  </strong>
                </div>

                {selectedOrder.typeVente === "lot" && (
                  <div className="modal-info-item">
                    <span>Composition du lot</span>

                    <strong>
                      {getLotComposition(selectedOrder) || "—"}
                    </strong>
                  </div>
                )}

                <div className="modal-info-item">
                  <span>Prix unitaire</span>

                  <strong>
                    {formatPrice(selectedOrder.prixUnitaire)} FCFA
                  </strong>
                </div>

                <div className="modal-info-item">
                  <span>Montant total</span>

                  <strong className="modal-total">
                    {formatPrice(selectedOrder.montant)} FCFA
                  </strong>
                </div>

                <div className="modal-info-item">
                  <span>Date</span>

                  <strong>
                    {formatDateTime(selectedOrder.createdAt)}
                  </strong>
                </div>

                <div className="modal-info-item">
                  <span>Acheteur</span>

                  <strong>
                    {selectedOrder.acheteur?.nom || "Inconnu"}
                  </strong>
                </div>

                <div className="modal-info-item">
                  <span>Vendeur</span>

                  <strong>
                    {selectedOrder.vendeur?.nom || "Inconnu"}
                  </strong>
                </div>

              </div>

              {/* LOCALISATION */}

              {selectedOrder.localisationLivraison && (
                <div className="order-location">
                  <FaMapMarkerAlt />

                  <div>
                    <span>Lieu de livraison</span>

                    <strong>
                      {selectedOrder.localisationLivraison}
                    </strong>
                  </div>
                </div>
              )}

              {/* FORMULAIRE */}

              <div className="order-modal-form">

                <label htmlFor="order-status">
                  Nouveau statut
                </label>

                <select
                  id="order-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={updating}
                >
                  <option value="En attente">
                    En attente
                  </option>

                  <option value="Confirmée">
                    Confirmée
                  </option>

                  <option value="Payée">
                    Payée
                  </option>

                  <option value="Expédiée">
                    Expédiée
                  </option>

                  <option value="Livrée">
                    Livrée
                  </option>

                  <option value="Annulée">
                    Annulée
                  </option>
                </select>

              </div>

            </div>

            {/* FOOTER */}

            <div className="order-modal-actions">

              <button
                type="button"
                className="modal-cancel-btn"
                onClick={closeModal}
                disabled={updating}
              >
                Annuler
              </button>

              <button
                type="button"
                className="modal-save-btn"
                onClick={updateStatus}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <span className="button-spinner"></span>
                    Modification...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Enregistrer
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminOrders;