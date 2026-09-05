import { useState } from "react";
import api from "../services/api";
import "../css/addProduct.css";
import imageCompression from "browser-image-compression";

import {
  formatUnite,
  getUnitesForSaleType,
  getPricePreview,
} from "../utils/productFormatters";

function AddProduct() {
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    categorie: "",
    typeVente: "",
    prix: "",
    unite: "",
    quantiteParLot: "",
    quantite: "",
    localisation: "",
  });

  const [images, setImages] = useState([]);

  // ==================================================
  // CHANGEMENT DES CHAMPS
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Changement du type de vente
    if (name === "typeVente") {
      setFormData((prev) => ({
        ...prev,
        typeVente: value,
        unite: "",
        quantiteParLot: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==================================================
  // IMAGES
  // ==================================================

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const options = {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    };

    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          const compressed =
            await imageCompression(
              file,
              options
            );

          console.log(
            file.name,
            (file.size / 1024).toFixed(0) +
              "KB →",
            (compressed.size / 1024).toFixed(0) +
              "KB"
          );

          return compressed;
        })
      );

      setImages(compressedFiles);
    } catch (error) {
      console.log(
        "Erreur compression images :",
        error
      );
    }
  };

  // ==================================================
  // ENVOI DU FORMULAIRE
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Type de vente
    if (!formData.typeVente) {
      alert(
        "Veuillez choisir un type de vente."
      );
      return;
    }

    // Unité
    if (!formData.unite) {
      alert(
        "Veuillez choisir une unité."
      );
      return;
    }

    // Lot
    if (
      formData.typeVente === "lot" &&
      !formData.quantiteParLot
    ) {
      alert(
        "Veuillez indiquer la quantité contenue dans chaque lot."
      );
      return;
    }

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        // Pas de quantité par lot
        // si ce n'est pas une vente par lot
        if (
          key === "quantiteParLot" &&
          formData.typeVente !== "lot"
        ) {
          data.append(key, "");
        } else {
          data.append(
            key,
            formData[key]
          );
        }
      });

      // Images
      if (images.length > 0) {
        images.forEach((img) => {
          data.append("images", img);
        });
      }

      const token =
        localStorage.getItem("token");

      const res = await api.post(
        "/products",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      alert(res.data.message);

      // Réinitialisation
      setFormData({
        nom: "",
        description: "",
        categorie: "",
        typeVente: "",
        prix: "",
        unite: "",
        quantiteParLot: "",
        quantite: "",
        localisation: "",
      });

      setImages([]);
    } catch (error) {
      console.error(
        "Erreur publication :",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Une erreur est survenue"
      );
    }
  };

  // ==================================================
  // UNITÉS
  // ==================================================

  const availableUnits =
    getUnitesForSaleType(
      formData.typeVente
    );

  // ==================================================
  // AFFICHAGE
  // ==================================================

  return (
    <div className="add-product">

      <h1>Publier un produit</h1>

      <form onSubmit={handleSubmit}>

        {/* =========================
            INFORMATIONS
        ========================= */}

        <input
          type="text"
          name="nom"
          placeholder="Nom du produit"
          value={formData.nom}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description du produit"
          value={
            formData.description
          }
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="categorie"
          placeholder="Catégorie"
          value={formData.categorie}
          onChange={handleChange}
          required
        />

        {/* =========================
            TYPE DE VENTE
        ========================= */}

        <label>
          Type de vente
        </label>

        <select
          name="typeVente"
          value={formData.typeVente}
          onChange={handleChange}
          required
        >

          <option value="">
            Choisir le type de vente
          </option>

          <option value="poids">
            Au poids
          </option>

          <option value="unite">
            À l'unité
          </option>

          <option value="lot">
            Par lot
          </option>

        </select>

        {/* =========================
            UNITÉ
        ========================= */}

        {formData.typeVente &&
          formData.typeVente !== "lot" && (

          <>

            <label>
              Unité de vente
            </label>

            <select
              name="unite"
              value={formData.unite}
              onChange={handleChange}
              required
            >

              <option value="">
                Choisir une unité
              </option>

              {availableUnits.map(
                (item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                )
              )}

            </select>

          </>
        )}

        {/* =========================
            LOT
        ========================= */}

        {formData.typeVente ===
          "lot" && (

          <div className="lot-section">

            <label>
              Contenu du lot
            </label>

            <div className="lot-group">

              <input
                type="number"
                name="quantiteParLot"
                placeholder="Quantité"
                value={
                  formData.quantiteParLot
                }
                onChange={
                  handleChange
                }
                min="1"
                required
              />

              <select
                name="unite"
                value={
                  formData.unite
                }
                onChange={
                  handleChange
                }
                required
              >

                <option value="">
                  Unité
                </option>

                {availableUnits.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* APERÇU LOT */}

            {formData.quantiteParLot &&
              formData.unite && (

              <p className="lot-preview">

                Chaque lot contient{" "}

                <strong>
                  {
                    formData.quantiteParLot
                  }{" "}
                  {formatUnite(
                    formData.unite
                  )}
                </strong>

              </p>
            )}

          </div>
        )}

        {/* =========================
            PRIX
        ========================= */}

        <div className="price-group">

          <input
            type="number"
            name="prix"
            placeholder="Prix"
            value={formData.prix}
            onChange={handleChange}
            min="0"
            required
          />

          <span>
            FCFA
          </span>

        </div>

        {/* =========================
            APERÇU PRIX
        ========================= */}

        {formData.prix &&
          formData.unite && (

          <p className="price-preview">

            {getPricePreview(
              formData
            )}

          </p>
        )}

        {/* =========================
            STOCK
        ========================= */}

        <input
          type="number"
          name="quantite"
          placeholder={
            formData.typeVente ===
            "lot"
              ? "Nombre de lots disponibles"
              : "Quantité disponible"
          }
          value={formData.quantite}
          onChange={handleChange}
          min="0"
          required
        />

        {/* =========================
            LOCALISATION
        ========================= */}

        <input
          type="text"
          name="localisation"
          placeholder="Localisation"
          value={
            formData.localisation
          }
          onChange={handleChange}
          required
        />

        {/* =========================
            IMAGES
        ========================= */}

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={
            handleImageChange
          }
        />

        {images.length > 0 && (

          <div className="image-preview-grid">

            {images.map(
              (img, index) => (

              <div
                key={index}
                className="preview-item"
              >

                <img
                  src={URL.createObjectURL(
                    img
                  )}
                  alt="preview"
                />

                <span>
                  {(
                    img.size / 1024
                  ).toFixed(0)}{" "}
                  KB
                </span>

              </div>
            ))}

          </div>
        )}

        {/* =========================
            BOUTON
        ========================= */}

        <button type="submit">
          Publier le produit
        </button>

      </form>

    </div>
  );
}

export default AddProduct;