import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/dashboard.css";
import { Link } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { optimizeImage } from "../utils/cloudinary";
import {
  formatUnite,
  getPrixLabel,
  getSaleTypeLabel,
  getStockLabel,
} from "../utils/productFormatters";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// Icons
import {
  FaDollarSign,
  FaMapMarkedAlt,
  FaCar,
} from "react-icons/fa";

import { GiCardboardBox } from "react-icons/gi";
import { IoMdCube } from "react-icons/io";
import { GoGraph } from "react-icons/go";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [images, setImages] = useState([]);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    chartData: [],
    averageRating: 0,
    totalReviews: 0,
    latestReviews: [],
  });

  // ==================================================
  // CHARGEMENT
  // ==================================================

  useEffect(() => {
    fetchMyProducts();
    fetchStats();
  }, []);

  // ==================================================
  // RÉCUPÉRER MES PRODUITS
  // ==================================================

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/products/mes-produits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ==================================================
  // SUPPRIMER PRODUIT
  // ==================================================

  const deleteProduct = async (id) => {
    if (
      !window.confirm(
        "Voulez-vous supprimer ce produit ?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchMyProducts();

      alert("Produit supprimé avec succès");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Erreur"
      );
    }
  };

  // ==================================================
  // MODIFIER PRODUIT
  // ==================================================

  const handleEdit = (product) => {
  setEditingProduct({
    ...product,
    typeVente: product.typeVente || "",
    unite: product.unite || "",
    quantiteParLot: product.quantiteParLot || "",
  });

  setImages([]);
};

  const handleEditChange = (e) => {
  const { name, value } = e.target;

  if (name === "typeVente") {
    setEditingProduct({
      ...editingProduct,
      typeVente: value,
      unite: "",
      quantiteParLot: "",
    });

    return;
  }

  setEditingProduct({
    ...editingProduct,
    [name]: value,
  });
};

  // ==================================================
  // MODIFIER PRODUIT
  // ==================================================

  const updateProduct = async (e) => {
  e.preventDefault();

  if (!editingProduct.typeVente) {
    alert("Veuillez choisir un type de vente.");
    return;
  }

  if (!editingProduct.unite) {
    alert("Veuillez choisir une unité.");
    return;
  }

  if (
    editingProduct.typeVente === "lot" &&
    !editingProduct.quantiteParLot
  ) {
    alert(
      "Veuillez indiquer la quantité contenue dans chaque lot."
    );
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const data = new FormData();

    data.append("nom", editingProduct.nom);
    data.append(
      "description",
      editingProduct.description
    );
    data.append(
      "categorie",
      editingProduct.categorie
    );

    data.append(
      "typeVente",
      editingProduct.typeVente
    );

    data.append(
      "prix",
      editingProduct.prix
    );

    data.append(
      "unite",
      editingProduct.unite
    );

    data.append(
      "quantite",
      editingProduct.quantite
    );

    data.append(
      "localisation",
      editingProduct.localisation
    );

    // =========================
    // QUANTITÉ PAR LOT
    // =========================

    if (
      editingProduct.typeVente === "lot"
    ) {
      data.append(
        "quantiteParLot",
        editingProduct.quantiteParLot
      );
    } else {
      data.append(
        "quantiteParLot",
        ""
      );
    }

    // =========================
    // IMAGES
    // =========================

    if (images.length > 0) {
      images.forEach((img) => {
        data.append("images", img);
      });
    }

    await api.put(
      `/products/${editingProduct._id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert("Produit modifié avec succès.");

    setEditingProduct(null);
    setImages([]);

    fetchMyProducts();

  } catch (error) {
    console.error(
      "Erreur modification :",
      error.response?.data || error
    );

    alert(
      error.response?.data?.message ||
        "Erreur lors de la modification du produit."
    );
  }
};

  // ==================================================
  // STATISTIQUES PRODUITS
  // ==================================================

  const totalProducts = products.length;

  const totalValue = products.reduce(
    (total, product) =>
      total +
      Number(product.prix || 0) *
        Number(product.quantite || 0),
    0
  );

  const totalLocations = new Set(
    products.map(
      (product) => product.localisation
    )
  ).size;

  // ==================================================
  // STATISTIQUES VENDEUR
  // ==================================================

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(
        "/orders/seller-stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats({
        totalRevenue:
          res.data.totalRevenue || 0,

        totalOrders:
          res.data.totalOrders || 0,

        deliveredOrders:
          res.data.deliveredOrders || 0,

        chartData:
          res.data.chartData || [],

        averageRating:
          res.data.averageRating || 0,

        totalReviews:
          res.data.totalReviews || 0,

        latestReviews:
          res.data.latestReviews || [],
      });
    } catch (error) {
      console.log(error);
    }
  };

  // ==================================================
  // IMAGE MODIFICATION
  // ==================================================

  const filesModification = async (e) => {
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
        const compressed = await imageCompression(
          file,
          options
        );

        console.log(
          file.name,
          (file.size / 1024).toFixed(0) + "KB →",
          (compressed.size / 1024).toFixed(0) + "KB"
        );

        return compressed;
      })
    );

    setImages(compressedFiles);
  } catch (error) {
    console.log(error);
  }
};

  // ==================================================
  // AFFICHAGE
  // ==================================================

  return (
    <div className="dashboard">

      <h1>Mon tableau de bord</h1>

      <Link
        className="add-btn"
        to="/add-product"
      >
        + Publier un produit
      </Link>

      <Link
        to="/edit-profile"
        className="edit-profile-btn"
      >
        Modifier mon profil
      </Link>

      <Link to="/seller-orders">
        Commandes reçues
      </Link>

      <Link
        to="/seller-payments"
        className="dashboard-btn"
      >
        Paiements reçus
      </Link>

      {products.length === 0 ? (
        <p>
          Vous n'avez publié aucun produit.
        </p>
      ) : (
        <>

          {/* =========================
              STATISTIQUES
          ========================= */}

          <div className="stats-grid">

            <div className="stat-card">
              <h3>
                <FaDollarSign /> Revenus
              </h3>

              <p>
                {Number(
                  stats.totalRevenue
                ).toLocaleString("fr-FR")}{" "}
                FCFA
              </p>
            </div>

            <div className="stat-card">
              <h3>
                <IoMdCube /> Commandes
              </h3>

              <p>
                {stats.totalOrders}
              </p>
            </div>

            <div className="stat-card">
              <h3>
                <FaCar /> Livrées
              </h3>

              <p>
                {stats.deliveredOrders}
              </p>
            </div>

            <div className="stat-card">
              <h3>
                ⭐ Note moyenne
              </h3>

              <p>
                {stats.averageRating}/5
              </p>

              <small>
                {stats.totalReviews} avis
              </small>
            </div>

          </div>

          {/* =========================
              STATISTIQUES PRODUITS
          ========================= */}

          <div className="stats">

            <div className="stat-card">
              <h2>
                <GiCardboardBox />
              </h2>

              <h3>
                {totalProducts}
              </h3>

              <p>Produits</p>
            </div>

            <div className="stat-card">
              <h2>
                <FaDollarSign />
              </h2>

              <h3>
                {totalValue.toLocaleString(
                  "fr-FR"
                )}{" "}
                FCFA
              </h3>

              <p>Valeur totale</p>
            </div>

            <div className="stat-card">
              <h2>
                <FaMapMarkedAlt />
              </h2>

              <h3>
                {totalLocations}
              </h3>

              <p>Localités</p>
            </div>

          </div>

          {/* =========================
              GRAPHIQUE
          ========================= */}

          <div className="chart-card">

            <h2>
              <GoGraph /> Ventes par mois
            </h2>

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <LineChart
                data={stats.chartData}
              >
                <XAxis dataKey="mois" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="ventes"
                  stroke="#2e7d32"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>

          </div>

          {/* =========================
              AVIS
          ========================= */}

          <div className="reviews-card">

            <h2>
              ⭐ Derniers avis reçus
            </h2>

            {stats.latestReviews
              .length === 0 ? (
              <p>
                Aucun avis reçu pour le
                moment.
              </p>
            ) : (
              stats.latestReviews.map(
                (review) => (
                  <div
                    key={review._id}
                    className="review-item"
                  >

                    <div className="review-header">

                      <strong>
                        {review.acheteur
                          ?.nom ||
                          "Utilisateur"}
                      </strong>

                      <span>
                        {"⭐".repeat(
                          Math.round(
                            review.note || 0
                          )
                        )}
                      </span>

                    </div>

                    <p>
                      {review.commentaire ||
                        "Aucun commentaire"}
                    </p>

                    <small>
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString(
                        "fr-FR"
                      )}
                    </small>

                  </div>
                )
              )
            )}

          </div>

          {/* =========================
              MES PRODUITS
          ========================= */}

          <div className="dashboard-products">

            {products.map((product) => (

              <div
                className="dashboard-card"
                key={product._id}
              >

                <img
                  src={optimizeImage(
                    product.images?.[0] ||
                      product.image,
                    400
                  )}
                  alt={product.nom}
                  loading="lazy"
                  decoding="async"
                />

                
                <h3>{product.nom}</h3>

<span className="badge">
  {product.categorie}
</span>

<p>
  <strong>Type de vente :</strong>{" "}
  {getSaleTypeLabel(product)}
</p>

<p>
  <strong>Prix :</strong>{" "}
  {getPrixLabel(product)}
</p>

<p>
  <strong>Stock :</strong>{" "}
  {getStockLabel(product)}
</p>

{product.typeVente === "lot" &&
  product.quantiteParLot && (
    <p>
      <strong>Composition :</strong>{" "}
      {product.quantiteParLot}{" "}
      {formatUnite(product.unite)}
      {" / lot"}
    </p>
  )}

<p>
  Publié le{" "}
  {new Date(product.createdAt).toLocaleDateString("fr-FR")}
</p>

<p>{product.localisation}</p>

                {/* ACTIONS */}

                <div className="actions">

                  <button
                    className="btn-modifier"
                    onClick={() =>
                      handleEdit(product)
                    }
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() =>
                      deleteProduct(
                        product._id
                      )
                    }
                  >
                    Supprimer
                  </button>

                </div>

              </div>

            ))}

          </div>

        </>
      )}

      {/* =========================
          FORMULAIRE MODIFICATION
      ========================= */}
      
      {editingProduct && (
  <form
    className="edit-form"
    onSubmit={updateProduct}
  >

    <h2>Modifier le produit</h2>

    {/* =========================
        INFORMATIONS PRODUIT
    ========================= */}

    <input
      type="text"
      name="nom"
      placeholder="Nom du produit"
      value={editingProduct.nom || ""}
      onChange={handleEditChange}
      required
    />

    <textarea
      name="description"
      placeholder="Description du produit"
      value={editingProduct.description || ""}
      onChange={handleEditChange}
      required
    />

    <input
      type="text"
      name="categorie"
      placeholder="Catégorie"
      value={editingProduct.categorie || ""}
      onChange={handleEditChange}
      required
    />

    {/* =========================
        TYPE DE VENTE
    ========================= */}

    <label>Type de vente</label>

    <select
      name="typeVente"
      value={editingProduct.typeVente || ""}
      onChange={handleEditChange}
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

    {editingProduct.typeVente &&
      editingProduct.typeVente !== "lot" && (
        <>
          <label>Unité de vente</label>

          <select
            name="unite"
            value={editingProduct.unite || ""}
            onChange={handleEditChange}
            required
          >
            <option value="">
              Choisir une unité
            </option>

            {editingProduct.typeVente ===
              "poids" && (
              <>
                <option value="1kg">
                  1 kg
                </option>

                <option value="5kg">
                  5 kg
                </option>

                <option value="10kg">
                  10 kg
                </option>

                <option value="25kg">
                  25 kg
                </option>

                <option value="50kg">
                  50 kg
                </option>

                <option value="100kg">
                  100 kg
                </option>

                <option value="1tonne">
                  1 tonne
                </option>
              </>
            )}

            {editingProduct.typeVente ===
              "unite" && (
              <>
                <option value="piece">
                  Pièce
                </option>

                <option value="sac">
                  Sac
                </option>

                <option value="caisse">
                  Caisse
                </option>

                <option value="carton">
                  Carton
                </option>

                <option value="bidon">
                  Bidon
                </option>

                <option value="litre">
                  Litre
                </option>
              </>
            )}

          </select>
        </>
      )}

    {/* =========================
        LOT
    ========================= */}

    {editingProduct.typeVente ===
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
              editingProduct.quantiteParLot ||
              ""
            }
            onChange={handleEditChange}
            min="1"
            required
          />

          <select
            name="unite"
            value={
              editingProduct.unite || ""
            }
            onChange={handleEditChange}
            required
          >

            <option value="">
              Unité
            </option>

            <option value="kg">
              kg
            </option>

            <option value="piece">
              pièce(s)
            </option>

            <option value="sac">
              sac(s)
            </option>

            <option value="caisse">
              caisse(s)
            </option>

            <option value="carton">
              carton(s)
            </option>

          </select>

        </div>

        {editingProduct.quantiteParLot &&
          editingProduct.unite && (
            <p className="lot-preview">

              Chaque lot contient{" "}

              <strong>
                {editingProduct.quantiteParLot}{" "}
                {editingProduct.unite}
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
        value={editingProduct.prix || ""}
        onChange={handleEditChange}
        min="0"
        required
      />

      <span>FCFA</span>

    </div>

    {/* =========================
        APERÇU PRIX
    ========================= */}

    {editingProduct.prix &&
      editingProduct.unite && (
      <p className="price-preview">

        Prix de vente :{" "}

        <strong>
          {Number(
            editingProduct.prix
          ).toLocaleString()} FCFA
        </strong>

        {" / "}

        {editingProduct.typeVente ===
        "lot"
          ? `lot de ${editingProduct.quantiteParLot} ${editingProduct.unite}`
          : editingProduct.unite}

      </p>
    )}

    {/* =========================
        STOCK
    ========================= */}

    <input
      type="number"
      name="quantite"
      placeholder={
        editingProduct.typeVente ===
        "lot"
          ? "Nombre de lots disponibles"
          : "Quantité disponible"
      }
      value={
        editingProduct.quantite || ""
      }
      onChange={handleEditChange}
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
        editingProduct.localisation || ""
      }
      onChange={handleEditChange}
      required
    />

    {/* =========================
        IMAGES
    ========================= */}

    <label>
      Nouvelles images
    </label>

    <input
      type="file"
      accept="image/*"
      multiple
      onChange={filesModification}
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
        ACTIONS
    ========================= */}

    <div className="edit-actions">

      <button type="submit">
        Enregistrer
      </button>

      <button
        type="button"
        onClick={() => {
          setEditingProduct(null);
          setImages([]);
        }}
      >
        Annuler
      </button>

    </div>

  </form>
)}

    </div>
  );
}

export default Dashboard;