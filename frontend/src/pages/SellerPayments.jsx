import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/payments.css";

import {
  formatUnite,
  formatUnitePluriel,
  getOrderQuantityLabel,
} from "../utils/productFormatters";

function SellerPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/orders/seller-payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("PAIEMENTS VENDEUR =", res.data);

      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(
        "Erreur récupération paiements :",
        error
      );
    }
  };

  return (
    <div className="payments-container">
      <h1>Paiements reçus</h1>

      {payments.length === 0 ? (
        <p>Aucun paiement reçu.</p>
      ) : (
        payments.map((payment) => {
          const produit = payment.produit;
          const acheteur = payment.acheteur;

          return (
            <div
              key={payment._id}
              className="payment-card"
            >
              {/* IMAGE DU PRODUIT */}
              <img
                src={
                  produit?.images?.[0] ||
                  produit?.image ||
                  "/placeholder-product.png"
                }
                alt={produit?.nom || "Produit"}
              />

              <div className="payment-info">

                {/* PRODUIT */}
                <h3>
                  {produit?.nom || "Produit indisponible"}
                </h3>

                {/* ACHETEUR */}
                <p>
                  <strong>Acheteur :</strong>{" "}
                  {acheteur?.nom || "Acheteur indisponible"}
                </p>

                {/* TYPE DE VENTE */}
                {payment.typeVente && (
                  <p>
                    <strong>Type de vente :</strong>{" "}
                    {payment.typeVente === "poids"
                      ? "Au poids"
                      : payment.typeVente === "unite"
                      ? payment.unite === "piece"
                        ? "À l'unité"
                        : `Par ${formatUnite(
                            payment.unite
                          )}`
                      : "Par lot"}
                  </p>
                )}

                {/* QUANTITÉ */}
                <p>
                  <strong>Quantité :</strong>{" "}
                  {getOrderQuantityLabel(payment)}
                </p>

                {/* UNITÉ */}
                {payment.unite && (
                  <p>
                    <strong>Unité :</strong>{" "}
                    {formatUnite(payment.unite)}
                  </p>
                )}

                {/* COMPOSITION DU LOT */}
                {payment.typeVente === "lot" &&
  payment.quantiteParLot && (
    <p>
      <strong>Composition :</strong>{" "}
      {payment.quantiteParLot}{" "}
      {formatUnitePluriel(
        payment.unite,
        payment.quantiteParLot
      )}{" "}
      / lot
    </p>
  )}

                {/* PRIX UNITAIRE */}
                {payment.prixUnitaire !== undefined && (
                  <p>
                    <strong>Prix unitaire :</strong>{" "}
                    {Number(
                      payment.prixUnitaire
                    ).toLocaleString("fr-FR")}{" "}
                    FCFA
                    {payment.typeVente === "lot"
                      ? " / lot"
                      : payment.unite
                      ? ` / ${formatUnite(
                          payment.unite
                        )}`
                      : ""}
                  </p>
                )}

                {/* MONTANT */}
                <p className="payment-total">
                  <strong>Montant :</strong>{" "}
                  {Number(
                    payment.montant || 0
                  ).toLocaleString("fr-FR")}{" "}
                  FCFA
                </p>

                {/* MÉTHODE */}
                <p>
                  <strong>Méthode :</strong>{" "}
                  {payment.methodePaiement ||
                    "Non renseignée"}
                </p>

                {/* STATUT */}
                <p
                  className={
                    payment.statutPaiement === "Payé"
                      ? "paid"
                      : "pending"
                  }
                >
                  {payment.statutPaiement === "Payé"
                    ? "✅ Payé"
                    : `⏳ ${
                        payment.statutPaiement ||
                        "En attente"
                      }`}
                </p>

                {/* DATE */}
                <p>
                  <strong>Date :</strong>{" "}
                  {payment.createdAt
                    ? new Date(
                        payment.createdAt
                      ).toLocaleDateString("fr-FR")
                    : "Date inconnue"}
                </p>

              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default SellerPayments;