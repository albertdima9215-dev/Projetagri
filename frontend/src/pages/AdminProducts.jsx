import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/adminProducts.css";

import {
  getPrixLabel,
  getSaleTypeLabel,
  getStockLabel,
} from "../utils/productFormatters";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==================================================
  // RÉCUPÉRER LES PRODUITS
  // ==================================================

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data);
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Impossible de récupérer les produits."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // SUPPRIMER UN PRODUIT
  // ==================================================

  const deleteProduct = async (id) => {
    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer ce produit ?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) => product._id !== id
        )
      );

      alert("Produit supprimé avec succès.");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Erreur lors de la suppression du produit."
      );
    }
  };

  // ==================================================
  // AFFICHAGE
  // ==================================================

  return (
    <div className="admin-products">

      <div className="admin-products-header">
        <div>
          <h1>Gestion des produits</h1>

          <p>
            Gérez et surveillez les produits publiés
            sur AgriConnect.
          </p>
        </div>

        <div className="products-count">
          {products.length} produit
          {products.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* =========================
          CHARGEMENT
      ========================= */}

      {loading ? (
        <div className="admin-loading">
          Chargement des produits...
        </div>
      ) : products.length === 0 ? (
        <div className="admin-empty">
          <h3>Aucun produit</h3>

          <p>
            Aucun produit n'est actuellement publié
            sur la plateforme.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Type de vente</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Vendeur</th>
                <th>Localisation</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {products.map((product) => (

                <tr key={product._id}>

                  {/* =========================
                      PRODUIT
                  ========================= */}

                  <td>
                    <div className="admin-product-info">

                      <img
                        src={
                          product.images?.[0] ||
                          product.image ||
                          ""
                        }
                        alt={product.nom}
                        className="admin-product-image"
                      />

                      <div>
                        <strong>
                          {product.nom}
                        </strong>

                        {product.description && (
                          <small>
                            {product.description.length > 60
                              ? `${product.description.substring(
                                  0,
                                  60
                                )}...`
                              : product.description}
                          </small>
                        )}
                      </div>

                    </div>
                  </td>

                  {/* =========================
                      CATÉGORIE
                  ========================= */}

                  <td>
                    <span className="category-badge">
                      {product.categorie}
                    </span>
                  </td>

                  {/* =========================
                      TYPE DE VENTE
                  ========================= */}

                  <td>
                    <span className="sale-type-badge">
                      {getSaleTypeLabel(product) ||
                        "Non défini"}
                    </span>

                    {product.typeVente === "lot" &&
                      product.quantiteParLot && (
                        <small className="lot-info">
                          {product.quantiteParLot}{" "}
                          {product.unite || ""} / lot
                        </small>
                      )}
                  </td>

                  {/* =========================
                      PRIX
                  ========================= */}

                  <td>
                    <strong className="product-price">
                      {getPrixLabel(product)}
                    </strong>
                  </td>

                  {/* =========================
                      STOCK
                  ========================= */}

                  <td>
                    <span
                      className={
                        Number(product.quantite || 0) === 0
                          ? "stock-badge stock-empty"
                          : "stock-badge"
                      }
                    >
                      {getStockLabel(product)}
                    </span>
                  </td>

                  {/* =========================
                      VENDEUR
                  ========================= */}

                  <td>
                    <div className="seller-info">

                      <strong>
                        {product.vendeur?.nom ||
                          "Vendeur inconnu"}
                      </strong>

                      {product.vendeur?.telephone && (
                        <small>
                          {product.vendeur.telephone}
                        </small>
                      )}

                    </div>
                  </td>

                  {/* =========================
                      LOCALISATION
                  ========================= */}

                  <td>
                    <span className="location">
                      📍 {product.localisation}
                    </span>
                  </td>

                  {/* =========================
                      ACTIONS
                  ========================= */}

                  <td>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteProduct(product._id)
                      }
                    >
                      Supprimer
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default AdminProducts;