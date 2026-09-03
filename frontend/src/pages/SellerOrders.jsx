import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/orders.css";
import { Link } from "react-router-dom";

// Icons
import { FaCheckSquare } from "react-icons/fa";

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [trackingNumbers, setTrackingNumbers] = useState({});
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/orders/seller-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (id, statut) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/orders/${id}`,
        {
          statut,
          numeroSuivi: trackingNumbers[id] || "",
        },
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

  const filteredOrders = orders.filter((order) => {
    // Ignorer les commandes avec données manquantes
    if (!order.produit || !order.acheteur) return false;

    const matchStatus =
      statusFilter === "Tous" || order.statut === statusFilter;

    const searchValue = search.toLowerCase();

    const matchSearch =
      order.produit.nom?.toLowerCase().includes(searchValue) ||
      order.acheteur.nom?.toLowerCase().includes(searchValue);

    return matchStatus && matchSearch;
  });

  // --------------------------------------------------
  // Affichage de la quantité selon le type de vente
  // --------------------------------------------------
  const getQuantityLabel = (order) => {
    if (order.typeVente === "lot") {
      return `${order.quantite} lot${
        order.quantite > 1 ? "s" : ""
      }`;
    }

    if (order.typeVente === "poids") {
      return `${order.quantite} × ${order.unite || ""}`;
    }

    if (order.typeVente === "unite") {
      return `${order.quantite} × ${order.unite || ""}`;
    }

    // Compatibilité avec les anciennes commandes
    return order.quantite;
  };

  // --------------------------------------------------
  // Description de la vente
  // --------------------------------------------------
  const getSaleDescription = (order) => {
    if (order.typeVente === "lot") {
      if (order.quantiteParLot) {
        return `${order.quantiteParLot} unités par lot`;
      }

      return "Vente par lot";
    }

    if (order.typeVente === "poids") {
      return `Vente au poids : ${order.unite || ""}`;
    }

    if (order.typeVente === "unite") {
      return `Vente à l'unité : ${order.unite || ""}`;
    }

    return "";
  };

  return (
    <div className="orders-container">
      <h1>Commandes reçues</h1>

      <Link to="/archives" className="archive-link">
        Voir les archives
      </Link>

      {/* =========================
          FILTRES
      ========================= */}
      <div className="orders-filters">
        <input
          type="text"
          placeholder="Rechercher un produit ou un acheteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>Tous</option>
          <option>En attente</option>
          <option>Confirmée</option>
          <option>Expédiée</option>
          <option>Livrée</option>
          <option>Annulée</option>
        </select>
      </div>

      {/* =========================
          COMMANDES
      ========================= */}
      {filteredOrders.length === 0 ? (
        <p>Aucune commande reçue.</p>
      ) : (
        filteredOrders.map((order) => (
          <div className="order-card" key={order._id}>

            {/* IMAGE PRODUIT */}
            <img
              src={
                order.produit.images?.[0] ||
                order.produit.image
              }
              alt={order.produit.nom}
            />

            <div className="order-info">

              {/* PRODUIT */}
              <h3>{order.produit?.nom}</h3>

              {/* ACHETEUR */}
              <p>
                <strong>Acheteur :</strong>{" "}
                {order.acheteur?.nom ||
                  "Acheteur indisponible"}
              </p>

              {/* TELEPHONE */}
              <p>
                <strong>Téléphone :</strong>{" "}
                {order.acheteur?.telephone || ""}
              </p>

              {/* TYPE DE VENTE */}
              {order.typeVente && (
                <p>
                  <strong>Type de vente :</strong>{" "}
                  {order.typeVente === "poids"
                    ? "Au poids"
                    : order.typeVente === "unite"
                    ? "À l'unité"
                    : "Par lot"}
                </p>
              )}

              {/* QUANTITE */}
              <p>
                <strong>Quantité commandée :</strong>{" "}
                {getQuantityLabel(order)}
              </p>

              {/* UNITE */}
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
                    <strong>Composition :</strong>{" "}
                    {order.quantiteParLot} unités / lot
                  </p>
                )}

              {/* PRIX UNITAIRE */}
              {order.prixUnitaire !== undefined && (
                <p>
                  <strong>Prix unitaire :</strong>{" "}
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
                <strong>Montant total :</strong>{" "}
                {Number(order.montant).toLocaleString(
                  "fr-FR"
                )}{" "}
                FCFA
              </p>

              {/* DATE */}
              <p>
                <strong>Date de commande :</strong>{" "}
                {new Date(
                  order.createdAt
                ).toLocaleDateString("fr-FR")}
              </p>

              {/* STATUT */}
              <span
                className={`status-badge ${order.statut.replace(
                  /\s/g,
                  "-"
                )}`}
              >
                {order.statut}
              </span>

              {/* NUMERO DE SUIVI */}
              {order.statut === "Confirmée" ||
              order.statut === "Expédiée" ? (
                <input
                  type="text"
                  placeholder="Numéro de suivi"
                  value={
                    trackingNumbers[order._id] ||
                    order.numeroSuivi ||
                    ""
                  }
                  onChange={(e) =>
                    setTrackingNumbers({
                      ...trackingNumbers,
                      [order._id]: e.target.value,
                    })
                  }
                />
              ) : null}

              {/* =========================
                  ACTIONS
              ========================= */}
              {order.statut !== "Livrée" &&
                order.statut !== "Annulée" && (
                  <>
                    <select
                      value={order.statut}
                      onChange={(e) =>
                        updateStatus(
                          order._id,
                          e.target.value
                        )
                      }
                    >
                      <option>En attente</option>
                      <option>Confirmée</option>
                      <option>Expédiée</option>
                      <option>Livrée</option>
                      <option>Annulée</option>
                    </select>

                    <div className="quick-actions">

                      {/* CONFIRMER */}
                      <button
                        className="quick-btn confirm"
                        onClick={() =>
                          updateStatus(
                            order._id,
                            "Confirmée"
                          )
                        }
                      >
                        ✔ Confirmer
                      </button>

                      {/* EXPEDIER */}
                      <button
                        className="quick-btn ship"
                        onClick={() =>
                          updateStatus(
                            order._id,
                            "Expédiée"
                          )
                        }
                      >
                        Expédier
                      </button>

                      {/* LIVRER */}
                      <button
                        className="quick-btn deliver"
                        onClick={() =>
                          updateStatus(
                            order._id,
                            "Livrée"
                          )
                        }
                      >
                        Livrer
                      </button>

                      {/* ANNULER */}
                      <button
                        className="quick-btn cancel"
                        onClick={() =>
                          updateStatus(
                            order._id,
                            "Annulée"
                          )
                        }
                      >
                        ✖ Annuler
                      </button>

                    </div>
                  </>
                )}

              {/* COMMANDE FINALISEE */}
              {order.statut === "Livrée" && (
                <p className="final-status">
                  <FaCheckSquare /> Commande finalisée
                </p>
              )}

              {/* COMMANDE ANNULEE */}
              {order.statut === "Annulée" && (
                <p className="final-status">
                  ❌ Commande annulée
                </p>
              )}

            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default SellerOrders;