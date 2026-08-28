import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/adminPromotions.css";

//icons
import { FaGripfire } from "react-icons/fa";

function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    image: "",
    produit: "",
    prixAvant: "",
    prixPromotion: "",
    reduction: "",
    dateDebut: "",
    dateFin: "",
    active: true,
  });

  useEffect(() => {
    fetchPromotions();
    fetchProducts();
  }, []);

  // ==============================
  // TOKEN
  // ==============================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ==============================
  // PROMOTIONS
  // ==============================

  const fetchPromotions = async () => {
    try {
      const token = getToken();

      const res = await api.get("/promotions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPromotions(res.data);
    } catch (error) {
      console.error("Erreur promotions :", error);

      alert(
        error.response?.data?.message ||
        "Impossible de récupérer les promotions."
      );
    }
  };

  // ==============================
  // PRODUITS
  // ==============================

  const fetchProducts = async () => {
    try {
      const token = getToken();

      const res = await api.get("/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data.produits || res.data);
    } catch (error) {
      console.error("Erreur produits :", error);
    }
  };

  // ==============================
  // CHANGEMENT FORMULAIRE
  // ==============================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==============================
  // CHOIX PRODUIT
  // ==============================

  const handleProductChange = (e) => {
  const productId = e.target.value;

  const product = products.find(
    (p) => p._id === productId
  );

  const productImage =
    product?.images?.[0] ||
    product?.image ||
    "";

  setForm((prev) => ({
    ...prev,
    produit: productId,
    prixAvant: product ? product.prix : "",
    image: productImage,
  }));
};

  // ==============================
  // CALCUL REDUCTION
  // ==============================

  const calculateReduction = () => {
    const prixAvant = Number(form.prixAvant);
    const prixPromotion = Number(form.prixPromotion);

    if (
      prixAvant > 0 &&
      prixPromotion > 0 &&
      prixPromotion < prixAvant
    ) {
      const reduction =
        ((prixAvant - prixPromotion) / prixAvant) * 100;

      return Math.round(reduction);
    }

    return 0;
  };

  // ==============================
  // CREER PROMOTION
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titre.trim()) {
      alert("Veuillez renseigner le titre.");
      return;
    }

    if (!form.dateDebut || !form.dateFin) {
      alert("Veuillez renseigner les dates.");
      return;
    }

    if (
      form.prixAvant &&
      form.prixPromotion &&
      Number(form.prixPromotion) >= Number(form.prixAvant)
    ) {
      alert(
        "Le prix promotionnel doit être inférieur au prix avant promotion."
      );
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      const reduction = calculateReduction();

      await api.post(
        "/promotions",
        {
          ...form,
          prixAvant: form.prixAvant
            ? Number(form.prixAvant)
            : null,

          prixPromotion: form.prixPromotion
            ? Number(form.prixPromotion)
            : null,

          reduction,
          produit: form.produit || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Promotion créée avec succès.");

      // Réinitialiser le formulaire
      setForm({
        titre: "",
        description: "",
        image: "",
        produit: "",
        prixAvant: "",
        prixPromotion: "",
        reduction: "",
        dateDebut: "",
        dateFin: "",
        active: true,
      });

      fetchPromotions();

    } catch (error) {
      console.error("Erreur création promotion :", error);

      alert(
        error.response?.data?.message ||
        "Erreur lors de la création de la promotion."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // SUPPRIMER
  // ==============================

  const deletePromotion = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer cette promotion ?"
    );

    if (!confirmation) return;

    try {
      const token = getToken();

      await api.delete(`/promotions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPromotions((prev) =>
        prev.filter((promotion) => promotion._id !== id)
      );

      alert("Promotion supprimée.");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Erreur lors de la suppression."
      );
    }
  };

  return (
    <div className="admin-promotions">

      <h1>Gestion des promotions</h1>

      {/* ==============================
          FORMULAIRE
      ============================== */}

      <div className="promotion-form-card">

        <h2>Créer une promotion</h2>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Titre de la promotion</label>

            <input
              type="text"
              name="titre"
              placeholder="Ex : 🔥 Promotion spéciale pommes de terre"
              value={form.titre}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              placeholder="Description de l'offre..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Produit concerné</label>

            <select
              name="produit"
              value={form.produit}
              onChange={handleProductChange}
            >
              <option value="">
                Aucun produit spécifique
              </option>

              {products.map((product) => (
                <option
                  key={product._id}
                  value={product._id}
                >
                  {product.nom} — {product.prix} FCFA
                </option>
              ))}
            </select>
          </div>

          <div className="promotion-prices">

            <div className="form-group">
              <label>Prix avant</label>

              <input
                type="number"
                name="prixAvant"
                value={form.prixAvant}
                onChange={handleChange}
                placeholder="1800"
              />
            </div>

            <div className="form-group">
              <label>Prix promotionnel</label>

              <input
                type="number"
                name="prixPromotion"
                value={form.prixPromotion}
                onChange={handleChange}
                placeholder="1500"
              />
            </div>

            <div className="form-group">
              <label>Réduction</label>

              <div className="reduction-preview">
                {calculateReduction()} %
              </div>
            </div>

          </div>

          {form.produit && form.image && (
          <div className="promotion-image-preview">
            <label>Image de la promotion</label>

            <img
      src={form.image}
      alt="Aperçu de la promotion"
    />

            <p>
      Cette image provient automatiquement du produit sélectionné.
            </p>

          </div>
          )}

          <div className="promotion-dates">

            <div className="form-group">
              <label>Date de début</label>

              <input
                type="datetime-local"
                name="dateDebut"
                value={form.dateDebut}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Date de fin</label>

              <input
                type="datetime-local"
                name="dateFin"
                value={form.dateFin}
                onChange={handleChange}
              />
            </div>

          </div>

          <label className="active-checkbox">

            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />

            Promotion active

          </label>

          <button
            type="submit"
            className="create-promotion-btn"
            disabled={loading}
          >
            {loading
              ? "Création..."
              : "Créer la promotion"}
          </button>

        </form>

      </div>

      {/* ==============================
          LISTE
      ============================== */}

      <div className="promotions-list">

        <h2>Promotions existantes</h2>

        {promotions.length === 0 ? (
          <p className="empty-promotions">
            Aucune promotion pour le moment.
          </p>
        ) : (
          promotions.map((promotion) => (

            <div
              className="promotion-admin-card"
              key={promotion._id}
            >

              {(promotion.image ||
  promotion.produit?.images?.[0] ||
  promotion.produit?.image) && (
                <img
    src={
      promotion.image ||
      promotion.produit?.images?.[0] ||
      promotion.produit?.image
    }
    alt={promotion.titre}
  />
              )}

              <div className="promotion-admin-info">

                <h3>{promotion.titre}</h3>

                <p>
                  {promotion.description}
                </p>

                {promotion.produit && (
                  <p>
                    <strong>Produit :</strong>{" "}
                    {promotion.produit.nom}
                  </p>
                )}

                {promotion.prixAvant &&
                  promotion.prixPromotion && (
                    <p className="promotion-price">

                      <span className="old-price">
                        {promotion.prixAvant} FCFA
                      </span>

                      <strong>
                        {promotion.prixPromotion} FCFA
                      </strong>

                      <span className="discount">
                        -{promotion.reduction}%
                      </span>

                    </p>
                  )}

                <p>
                  Du{" "}
                  {new Date(
                    promotion.dateDebut
                  ).toLocaleDateString("fr-FR")}
                  {" "}au{" "}
                  {new Date(
                    promotion.dateFin
                  ).toLocaleDateString("fr-FR")}
                </p>

                <span
                  className={
                    promotion.active
                      ? "promotion-active"
                      : "promotion-inactive"
                  }
                >
                  {promotion.active
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

              <div className="promotion-admin-actions">

                <button
                  className="delete-promotion-btn"
                  onClick={() =>
                    deletePromotion(promotion._id)
                  }
                >
                  Supprimer
                </button>

              </div>

            </div>

          ))
        )}

      </div>

    </div>
  );
}

export default AdminPromotions;