import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/productDetails.css";
import {
  formatUnite,
  getPrixLabel,
  getSaleTypeLabel,
  getQuantiteLabel,
  getOrderLabel,
  getSelectedQuantityLabel,
} from "../utils/productFormatters";
import { FaWhatsapp } from "react-icons/fa";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [showOrder, setShowOrder] = useState(false);
  const [quantite, setQuantite] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.error(
        "Erreur récupération produit :",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // AVIS
  // =========================

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${id}`);
      setReviews(res.data);
    } catch (error) {
      console.error(
        "Erreur récupération avis :",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // MESSAGERIE
  // =========================

  const startConversation = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Veuillez vous connecter pour contacter le vendeur.");
        return;
      }

      await api.post(
        "/messages",
        {
          destinataireId: product.vendeur._id,
          contenu:
            "Bonjour, je suis intéressé(e) par votre produit.",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/messages");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Erreur lors de l'envoi du message."
      );
    }
  };

  // =========================
  // WHATSAPP
  // =========================

  const contactWhatsApp = () => {
    const numero = product.vendeur?.telephoneComplet;

    if (!numero) {
      alert(
        "Le vendeur n'a pas renseigné de numéro WhatsApp."
      );
      return;
    }

    const message = `Bonjour ${product.vendeur.nom},

Je suis intéressé(e) par votre produit "${product.nom}".

Prix : ${getPrixLabel(product)}

Je viens de voir votre annonce sur AgriConnect.`;

    const url = `https://wa.me/${numero.replace(
      /\D/g,
      ""
    )}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  // =========================
// GESTION QUANTITÉ COMMANDE
// =========================

const diminuerQuantite = () => {
  setQuantite((prev) => {
    const nouvelleQuantite = Number(prev) - 1;

    return nouvelleQuantite >= 1
      ? nouvelleQuantite
      : 1;
  });
};

const augmenterQuantite = () => {
  setQuantite((prev) => {
    const nouvelleQuantite = Number(prev) + 1;

    return nouvelleQuantite <= Number(product.quantite)
      ? nouvelleQuantite
      : Number(product.quantite);
  });
};

const modifierQuantite = (value) => {
  const nouvelleQuantite = Number(value);

  if (
    Number.isNaN(nouvelleQuantite) ||
    nouvelleQuantite < 1
  ) {
    setQuantite(1);
    return;
  }

  if (
    nouvelleQuantite >
    Number(product.quantite)
  ) {
    setQuantite(Number(product.quantite));
    return;
  }

  setQuantite(nouvelleQuantite);
};

  // =========================
  // COMMANDE
  // =========================

  const createOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert(
          "Veuillez vous connecter pour passer une commande."
        );
        return;
      }

      const quantiteCommande = Number(quantite);

      if (
        !Number.isInteger(quantiteCommande) ||
        quantiteCommande < 1
      ) {
        alert("Veuillez choisir une quantité valide.");
        return;
      }

      if (quantiteCommande > product.quantite) {
        alert("La quantité demandée dépasse le stock disponible.");
        return;
      }

      const res = await api.post(
        "/orders",
        {
          produitId: product._id,
          quantite: quantiteCommande,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message);

      setShowOrder(false);

      navigate("/payment", {
        state: {
          order: res.data.commande,
        },
      });
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Erreur lors de la création de la commande."
      );
    }
  };

  // =========================
  // CHARGEMENT
  // =========================

  if (!product) {
    return <h2>Chargement...</h2>;
  }

  const prixUnitaire = Number(product.prix || 0);
  const quantiteCommande = Number(quantite || 0);

  const totalCommande =
    prixUnitaire * quantiteCommande;

  return (
    <div className="product-details">

      {/* =========================
          IMAGE PRINCIPALE
      ========================= */}

      <div className="product-image">
        <img
          src={
            product.images?.[selectedImage] ||
            product.image
          }
          alt={product.nom}
          className="main-image"
        />
      </div>

      {/* =========================
          MINIATURES
      ========================= */}

      <div className="thumbnails">
        {(product.images || []).map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Miniature ${index + 1}`}
            className={
              selectedImage === index
                ? "active"
                : ""
            }
            onClick={() =>
              setSelectedImage(index)
            }
          />
        ))}
      </div>

      {/* =========================
          INFORMATIONS PRODUIT
      ========================= */}

      <div className="product-info">

        <h1>{product.nom}</h1>

        {/* PRIX */}
        <h2>{getPrixLabel(product)}</h2>

        <p>
          <strong>
            Type de vente :
          </strong>{" "}
          {getSaleTypeLabel(product)}
        </p>

        <p>
          <strong>Stock disponible :</strong>{" "}
          {getQuantiteLabel(product)}
        </p>

        <p>
          <strong>Catégorie :</strong>{" "}
          {product.categorie}
        </p>

        <p>
          <strong>Localisation :</strong>{" "}
          {product.localisation}
        </p>

        <p>
          <strong>Description :</strong>
        </p>

        <p>{product.description}</p>

        <hr />

        {/* =========================
            VENDEUR
        ========================= */}

        <h3>Vendeur</h3>

        <Link
          className="link-nom-vendeur"
          to={`/seller/${product.vendeur._id}`}
        >
          {product.vendeur.nom}
        </Link>

        <p>{product.vendeur.email}</p>

        <button
          className="message-btn"
          onClick={startConversation}
        >
          Envoyer un message
        </button>

        <button
          className="whatsapp-contact-btn"
          onClick={contactWhatsApp}
        >
          <FaWhatsapp />
          Contacter sur WhatsApp
        </button>

        {/* =========================
            COMMANDER
        ========================= */}

        {product.quantite > 0 ? (
          <button
            className="order-btn"
            onClick={() => {
              setQuantite(1);
              setShowOrder(true);
            }}
          >
            Commander
          </button>
        ) : (
          <div className="out-of-stock">
            ❌ Rupture de stock
          </div>
        )}

      </div>

      {/* =========================
    MODALE COMMANDE
========================= */}

{showOrder && (
  <div
    className="order-modal"
    onClick={() => setShowOrder(false)}
  >
    <div
      className="order-content"
      onClick={(e) => e.stopPropagation()}
    >

      {/* TITRE */}

      <h2 className="order-title">
        Commander le produit
      </h2>

      {/* PRODUIT */}

      <p className="order-product">
        Produit :{" "}
        <strong>
          {product.nom}
        </strong>
      </p>

      {/* PRIX */}

      <p className="order-price">
        Prix :{" "}
        <strong>
          {getPrixLabel(product)}
        </strong>
      </p>

      {/* TYPE DE VENTE */}

      <p className="order-sale-type">
        Type de vente :{" "}
        <strong>
          {getSaleTypeLabel(product)}
        </strong>
      </p>

      {/* QUANTITÉ */}

      <label className="order-label">
        {getOrderLabel(product)}
      </label>

      <div className="quantity-control">

        <button
          type="button"
          className="quantity-btn"
          onClick={diminuerQuantite}
          disabled={quantite <= 1}
        >
          −
        </button>

        <input
          type="number"
          min="1"
          max={product.quantite}
          step="1"
          value={quantite}
          onChange={(e) =>
            modifierQuantite(e.target.value)
          }
          className="quantity-input"
        />

        <button
          type="button"
          className="quantity-btn"
          onClick={augmenterQuantite}
          disabled={
            quantite >= Number(product.quantite)
          }
        >
          +
        </button>

      </div>

      {/* LIMITES */}

      <p className="quantity-limit">
        Min : 1
        <span>|</span>
        Max :{" "}
        {Number(product.quantite).toLocaleString(
          "fr-FR"
        )}{" "}
        disponible
        {Number(product.quantite) > 1
          ? "s"
          : ""}
      </p>

      {/* INFORMATIONS QUANTITÉ */}

      <div className="selected-quantity-box">

        <div className="selected-quantity-icon">
        </div>

        <div>
          <p>
            Quantité choisie :{" "}
            <strong>
              {getSelectedQuantityLabel(
                product,
                quantite
              )}
            </strong>
          </p>

          {product.typeVente === "lot" &&
            product.quantiteParLot && (
              <small>
                ({quantite} lot
                {quantite > 1 ? "s" : ""} de{" "}
                {product.quantiteParLot}{" "}
                {product.unite === "piece"
                  ? product.quantiteParLot > 1
                    ? "pièces"
                    : "pièce"
                  : formatUnite(product.unite)}
                )
              </small>
            )}

          {product.typeVente === "poids" && (
            <small>
              ({quantite} unité
              {quantite > 1 ? "s" : ""} de{" "}
              {formatUnite(product.unite)})
            </small>
          )}
        </div>

      </div>

      {/* TOTAL */}

      <h3 className="order-total">
        Total :{" "}
        {totalCommande.toLocaleString(
          "fr-FR"
        )}{" "}
        FCFA
      </h3>

      {/* CONFIRMER */}

      <button
        className="confirm-order-btn"
        onClick={createOrder}
      >
        Confirmer la commande
      </button>

      {/* ANNULER */}

      <button
        className="cancel-command-btn"
        onClick={() => setShowOrder(false)}
      >
        Annuler
      </button>

    </div>
  </div>
)}

      {/* =========================
          AVIS
      ========================= */}

      <div className="reviews-section">

        <h2>Avis des acheteurs</h2>

        {reviews.length === 0 ? (
          <p>
            Aucun avis pour le moment.
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="review-card"
            >
              <strong>
                {review.acheteur.nom}
              </strong>

              <p>
                {"⭐".repeat(
                  review.note
                )}
              </p>

              <p>
                {review.commentaire}
              </p>

              <small>
                {new Date(
                  review.createdAt
                ).toLocaleDateString(
                  "fr-FR"
                )}
              </small>
            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default ProductDetails;