import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/productDetails.css";
import { FaWhatsapp } from "react-icons/fa";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [showOrder, setShowOrder] = useState(false);
  const [quantite, setQuantite] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);

  // =========================
  // FORMATAGE UNITÉS
  // =========================

  const formatUnite = (unite) => {
    const unites = {
      "1kg": "1 kg",
      "5kg": "5 kg",
      "10kg": "10 kg",
      "25kg": "25 kg",
      "50kg": "50 kg",
      "100kg": "100 kg",
      "1tonne": "1 tonne",

      piece: "pièce",
      sac: "sac",
      caisse: "caisse",
      carton: "carton",
      bidon: "bidon",
      litre: "litre",

      lot: "lot",
    };

    return unites[unite] || unite;
  };

  // =========================
  // INFORMATIONS DE VENTE
  // =========================

  const getPrixLabel = () => {
    if (!product) return "";

    const prix = Number(product.prix || 0).toLocaleString("fr-FR");

    const unite = formatUnite(product.unite || "1kg");

    if (product.typeVente === "lot") {
      const quantiteLot = Number(product.quantiteParLot || 0);

      return `${prix} FCFA / lot de ${quantiteLot} ${unite}${
        quantiteLot > 1 ? "s" : ""
      }`;
    }

    return `${prix} FCFA / ${unite}`;
  };

  const getQuantiteLabel = () => {
    if (!product) return "";

    const quantite = Number(product.quantite || 0);

    if (product.typeVente === "lot") {
      return `${quantite} lot${quantite > 1 ? "s" : ""}`;
    }

    if (product.typeVente === "poids") {
      const poids = {
        "1kg": 1,
        "5kg": 5,
        "10kg": 10,
        "25kg": 25,
        "50kg": 50,
        "100kg": 100,
        "1tonne": 1000,
      };

      const kg = poids[product.unite];

      if (kg) {
        const totalKg = quantite * kg;

        return `${totalKg.toLocaleString("fr-FR")} kg`;
      }
    }

    const unite = formatUnite(product.unite || "pièce");

    return `${quantite} ${unite}${quantite > 1 ? "s" : ""}`;
  };

  const getOrderLabel = () => {
    if (!product) return "Quantité";

    if (product.typeVente === "lot") {
      return "Nombre de lots";
    }

    if (product.typeVente === "poids") {
      return `Nombre de ${formatUnite(product.unite || "1kg")}`;
    }

    return `Nombre de ${formatUnite(product.unite || "pièce")}`;
  };

  const getSelectedQuantityLabel = () => {
    if (!product) return "";

    const qte = Number(quantite);

    if (product.typeVente === "lot") {
      return `${qte} lot${qte > 1 ? "s" : ""}`;
    }

    const unite = formatUnite(product.unite || "pièce");

    return `${qte} ${unite}${qte > 1 ? "s" : ""}`;
  };

  // =========================
  // PRODUIT
  // =========================

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

Prix : ${getPrixLabel()}

Je viens de voir votre annonce sur AgriConnect.`;

    const url = `https://wa.me/${numero.replace(
      /\D/g,
      ""
    )}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
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
        <h2>{getPrixLabel()}</h2>

        <p>
          <strong>Type de vente :</strong>{" "}
          {product.typeVente === "poids"
            ? "Au poids"
            : product.typeVente === "unite"
            ? "À l'unité"
            : "Par lot"}
        </p>

        <p>
          <strong>Stock disponible :</strong>{" "}
          {getQuantiteLabel()}
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
          onClick={() =>
            setShowOrder(false)
          }
        >
          <div
            className="order-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h2>
              Commander le produit
            </h2>

            <p>
              Produit :{" "}
              <strong>
                {product.nom}
              </strong>
            </p>

            <p>
              Prix :{" "}
              <strong>
                {getPrixLabel()}
              </strong>
            </p>

            <label>
              {getOrderLabel()}
            </label>

            <input
              type="number"
              min="1"
              max={product.quantite}
              step="1"
              value={quantite}
              onChange={(e) => {
                const value =
                  Number(e.target.value);

                if (
                  value >= 0 &&
                  value <= product.quantite
                ) {
                  setQuantite(value);
                }
              }}
            />

            <p>
              Quantité choisie :{" "}
              <strong>
                {getSelectedQuantityLabel()}
              </strong>
            </p>

            <h3>
              Total :{" "}
              {totalCommande.toLocaleString(
                "fr-FR"
              )}{" "}
              FCFA
            </h3>

            <button
              onClick={createOrder}
            >
              Confirmer la commande
            </button>

            <button
              onClick={() =>
                setShowOrder(false)
              }
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