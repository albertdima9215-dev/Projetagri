import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/dashboard.css";
import { Link } from "react-router-dom";

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

import { optimizeImage } from "../utils/cloudinary";

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
      typeVente: product.typeVente || "poids",
      unite: product.unite || "",
      quantiteParLot:
        product.quantiteParLot || "",
    });

    setImages([]);
  };

  const handleEditChange = (e) => {
    setEditingProduct({
      ...editingProduct,
      [e.target.name]: e.target.value,
    });
  };

  // ==================================================
  // MODIFIER PRODUIT
  // ==================================================

  const updateProduct = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const data = new FormData();

      data.append(
        "nom",
        editingProduct.nom
      );

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
        "unite",
        editingProduct.unite
      );

      data.append(
        "prix",
        editingProduct.prix
      );

      data.append(
        "quantite",
        editingProduct.quantite
      );

      data.append(
        "localisation",
        editingProduct.localisation
      );

      // Seulement pour les lots
      if (
        editingProduct.typeVente === "lot" &&
        editingProduct.quantiteParLot
      ) {
        data.append(
          "quantiteParLot",
          editingProduct.quantiteParLot
        );
      }

      // Images
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
          },
        }
      );

      alert(
        "Produit modifié avec succès"
      );

      setEditingProduct(null);
      setImages([]);

      fetchMyProducts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Erreur lors de la modification"
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
    try {
      const files = Array.from(
        e.target.files || []
      );

      if (files.length === 0) return;

      setImages(files);
    } catch (error) {
      console.log(error);
    }
  };

  // ==================================================
  // TYPE DE VENTE
  // ==================================================

  const getSaleTypeLabel = (product) => {
    if (product.typeVente === "poids") {
      return "Au poids";
    }

    if (product.typeVente === "unite") {
      return "À l'unité";
    }

    if (product.typeVente === "lot") {
      return "Par lot";
    }

    return "Non défini";
  };

  // ==================================================
  // STOCK
  // ==================================================

  const getStockLabel = (product) => {
    if (product.typeVente === "lot") {
      return `${product.quantite} lot${
        Number(product.quantite) > 1
          ? "s"
          : ""
      }`;
    }

    return `${product.quantite} × ${
      product.unite || ""
    }`;
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

                <h3>
                  {product.nom}
                </h3>

                <span className="badge">
                  {product.categorie}
                </span>

                {/* TYPE DE VENTE */}

                <p>
                  <strong>
                    Type de vente :
                  </strong>{" "}
                  {getSaleTypeLabel(product)}
                </p>

                {/* PRIX */}

                <p>
                  <strong>
                    Prix :
                  </strong>{" "}
                  {Number(
                    product.prix
                  ).toLocaleString(
                    "fr-FR"
                  )}{" "}
                  FCFA

                  {product.unite &&
                    ` / ${product.unite}`}
                </p>

                {/* STOCK */}

                <p>
                  <strong>
                    Stock :
                  </strong>{" "}
                  {getStockLabel(product)}
                </p>

                {/* COMPOSITION LOT */}

                {product.typeVente ===
                  "lot" &&
                  product.quantiteParLot && (
                    <p>
                      <strong>
                        Composition :
                      </strong>{" "}
                      {
                        product.quantiteParLot
                      }{" "}
                      unités / lot
                    </p>
                  )}

                {/* DATE */}

                <p>
                  Publié le{" "}
                  {new Date(
                    product.createdAt
                  ).toLocaleDateString(
                    "fr-FR"
                  )}
                </p>

                {/* LOCALISATION */}

                <p>
                  {product.localisation}
                </p>

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

          <h2>
            Modifier le produit
          </h2>

          <input
            type="text"
            name="nom"
            value={
              editingProduct.nom
            }
            onChange={
              handleEditChange
            }
          />

          <textarea
            name="description"
            value={
              editingProduct.description
            }
            onChange={
              handleEditChange
            }
          />

          <input
            type="text"
            name="categorie"
            value={
              editingProduct.categorie
            }
            onChange={
              handleEditChange
            }
          />

          {/* TYPE DE VENTE */}

          <label>
            Type de vente
          </label>

          <select
            name="typeVente"
            value={
              editingProduct.typeVente
            }
            onChange={
              handleEditChange
            }
          >

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

          {/* UNITÉ */}

          <label>
            Unité
          </label>

          <select
            name="unite"
            value={
              editingProduct.unite
            }
            onChange={
              handleEditChange
            }
          >

            {editingProduct.typeVente ===
              "poids" && (
              <>
                <option value="1kg">
                  1kg
                </option>

                <option value="5kg">
                  5kg
                </option>

                <option value="10kg">
                  10kg
                </option>

                <option value="25kg">
                  25kg
                </option>

                <option value="50kg">
                  50kg
                </option>

                <option value="100kg">
                  100kg
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

                <option value="bidon">
                  Bidon
                </option>

                <option value="bouteille">
                  Bouteille
                </option>

                <option value="plateau">
                  Plateau
                </option>
              </>
            )}

            {editingProduct.typeVente ===
              "lot" && (
              <option value="lot">
                Lot
              </option>
            )}

          </select>

          {/* COMPOSITION LOT */}

          {editingProduct.typeVente ===
            "lot" && (
            <>

              <label>
                Nombre d'unités par lot
              </label>

              <input
                type="number"
                name="quantiteParLot"
                min="1"
                value={
                  editingProduct.quantiteParLot ||
                  ""
                }
                onChange={
                  handleEditChange
                }
              />

            </>
          )}

          {/* PRIX */}

          <label>
            Prix
          </label>

          <input
            type="number"
            name="prix"
            min="0"
            value={
              editingProduct.prix
            }
            onChange={
              handleEditChange
            }
          />

          {/* QUANTITÉ */}

          <label>
            Stock disponible
          </label>

          <input
            type="number"
            name="quantite"
            min="0"
            value={
              editingProduct.quantite
            }
            onChange={
              handleEditChange
            }
          />

          {/* LOCALISATION */}

          <label>
            Localisation
          </label>

          <input
            type="text"
            name="localisation"
            value={
              editingProduct.localisation
            }
            onChange={
              handleEditChange
            }
          />

          {/* IMAGES */}

          <label>
            Nouvelles images
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={
              filesModification
            }
          />

          {/* ACTIONS */}

          <div className="edit-actions">

            <button type="submit">
              Enregistrer
            </button>

            <button
              type="button"
              onClick={() =>
                setEditingProduct(null)
              }
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