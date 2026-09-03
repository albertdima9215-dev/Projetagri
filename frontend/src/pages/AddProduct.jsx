import { useState } from "react";
import api from "../services/api";
import "../css/addProduct.css";
import imageCompression from "browser-image-compression";

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

  // =========================
  // UNITÉS DISPONIBLES
  // =========================

  const unitesPoids = [
    { value: "1kg", label: "1 kg" },
    { value: "5kg", label: "5 kg" },
    { value: "10kg", label: "10 kg" },
    { value: "25kg", label: "25 kg" },
    { value: "50kg", label: "50 kg" },
    { value: "100kg", label: "100 kg" },
    { value: "1tonne", label: "1 tonne" },
  ];

  const unites = [
    { value: "piece", label: "Pièce" },
    { value: "sac", label: "Sac" },
    { value: "caisse", label: "Caisse" },
    { value: "carton", label: "Carton" },
    { value: "bidon", label: "Bidon" },
    { value: "litre", label: "Litre" },
  ];

  const unitesLot = [
    { value: "kg", label: "kg" },
    { value: "piece", label: "pièce(s)" },
    { value: "sac", label: "sac(s)" },
    { value: "caisse", label: "caisse(s)" },
    { value: "carton", label: "carton(s)" },
  ];

  // =========================
  // CHANGEMENT DES CHAMPS
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si le type de vente change,
    // on réinitialise les unités précédentes.
    if (name === "typeVente") {
      setFormData({
        ...formData,
        typeVente: value,
        unite: "",
        quantiteParLot: "",
      });

      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================
  // IMAGES
  // =========================

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    const options = {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    };

    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          const compressed = await imageCompression(file, options);

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
      console.log(error);
    }
  };

  // =========================
  // ENVOI DU FORMULAIRE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification du type de vente
    if (!formData.typeVente) {
      alert("Veuillez choisir un type de vente.");
      return;
    }

    // Vérification de l'unité
    if (!formData.unite) {
      alert("Veuillez choisir une unité.");
      return;
    }

    // Vérification du lot
    if (
      formData.typeVente === "lot" &&
      !formData.quantiteParLot
    ) {
      alert("Veuillez indiquer la quantité contenue dans chaque lot.");
      return;
    }

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        // Pour les ventes qui ne sont pas par lot,
        // on envoie null pour quantiteParLot.
        if (
          key === "quantiteParLot" &&
          formData.typeVente !== "lot"
        ) {
          data.append(key, "");
        } else {
          data.append(key, formData[key]);
        }
      });

      // Ajouter les images
      if (images.length) {
        images.forEach((img) => {
          data.append("images", img);
        });
      }

      const token = localStorage.getItem("token");

      const res = await api.post("/products", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

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
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Une erreur est survenue"
      );
    }
  };

  // =========================
  // UNITÉS À AFFICHER
  // =========================

  const getUnites = () => {
    if (formData.typeVente === "poids") {
      return unitesPoids;
    }

    if (formData.typeVente === "unite") {
      return unites;
    }

    return [];
  };

  return (
    <div className="add-product">

      <h1>Publier un produit</h1>

      <form onSubmit={handleSubmit}>

        {/* =========================
            INFORMATIONS PRODUIT
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
          value={formData.description}
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

        <label>Type de vente</label>

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
              <label>Unité de vente</label>

              <select
                name="unite"
                value={formData.unite}
                onChange={handleChange}
                required
              >
                <option value="">
                  Choisir une unité
                </option>

                {getUnites().map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </>
          )}

        {/* =========================
            LOT
        ========================= */}

        {formData.typeVente === "lot" && (
          <div className="lot-section">

            <label>Contenu du lot</label>

            <div className="lot-group">

              <input
                type="number"
                name="quantiteParLot"
                placeholder="Quantité"
                value={formData.quantiteParLot}
                onChange={handleChange}
                min="1"
                required
              />

              <select
                name="unite"
                value={formData.unite}
                onChange={handleChange}
                required
              >
                <option value="">
                  Unité
                </option>

                {unitesLot.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>

            </div>

            {formData.quantiteParLot &&
              formData.unite && (
                <p className="lot-preview">
                  Chaque lot contient{" "}
                  <strong>
                    {formData.quantiteParLot}{" "}
                    {formData.unite}
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

          <span>FCFA</span>

        </div>

        {/* =========================
            APERÇU DU PRIX
        ========================= */}

        {formData.prix &&
          formData.unite && (
            <p className="price-preview">

              Prix de vente :{" "}

              <strong>
                {Number(formData.prix).toLocaleString()} FCFA
              </strong>

              {" / "}

              {formData.typeVente === "lot"
                ? `lot de ${formData.quantiteParLot} ${formData.unite}`
                : formData.unite}

            </p>
          )}

        {/* =========================
            STOCK
        ========================= */}

        <input
          type="number"
          name="quantite"
          placeholder={
            formData.typeVente === "lot"
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
          value={formData.localisation}
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
          onChange={handleImageChange}
        />

        {images.length > 0 && (
          <div className="image-preview-grid">

            {images.map((img, index) => (
              <div
                key={index}
                className="preview-item"
              >

                <img
                  src={URL.createObjectURL(img)}
                  alt="preview"
                />

                <span>
                  {(img.size / 1024).toFixed(0)} KB
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