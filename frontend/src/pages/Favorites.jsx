import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../css/favorites.css";
import { FaHeart } from "react-icons/fa";

import {
  getPrixLabel,
  getSaleTypeLabel,
  getStockLabel,
} from "../utils/productFormatters";

function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchFavorites();
  }, []);


  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavorites(res.data);
    } catch (error) {
      console.log(error);
    }
  };


  const removeFavorite = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/favorites/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchFavorites();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Erreur lors du retrait du favori"
      );
    }
  };


  return (
    <div className="favorites">

      <h1>
        <FaHeart /> Mes favoris
      </h1>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <FaHeart />

          <h2>Aucun favori</h2>

          <p>
            Vous n'avez encore ajouté aucun produit
            à vos favoris.
          </p>

          <Link to="/products">
            Découvrir les produits
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">

          {favorites.map((item) => {

            const product = item.produit;

            // Éviter une erreur si le produit
            // a été supprimé
            if (!product) return null;

            return (
              <div
                className="favorite-card"
                key={item._id}
              >

                <div className="favorite-image">

                  <img
                    src={
                      product.images?.[0] ||
                      product.image
                    }
                    alt={product.nom}
                  />

                  {/* RETIRER DES FAVORIS */}

                  <button
                    className="remove-favorite"
                    onClick={() =>
                      removeFavorite(product._id)
                    }
                    title="Retirer des favoris"
                  >
                    <FaHeart />
                  </button>

                </div>

                {/* =========================
                    INFORMATIONS
                ========================= */}

                <div className="favorite-info">

                  <h3>
                    {product.nom}
                  </h3>

                  {/* TYPE DE VENTE */}

                  {getSaleTypeLabel(product) && (
                    <span className="sale-type">
                      {getSaleTypeLabel(product)}
                    </span>
                  )}

                  {/* PRIX */}

                  <p className="favorite-price">
                    {getPrixLabel(product)}
                  </p>

                  {/* STOCK */}

                  <p className="favorite-stock">
                    {getStockLabel(product)}
                  </p>

                  {/* LOCALISATION */}

                  {product.localisation && (
                    <p className="favorite-location">
                      📍 {product.localisation}
                    </p>
                  )}

                  {/* =========================
                      ACTIONS
                  ========================= */}

                  <div className="favorite-actions">

                    <Link
                      to={`/products/${product._id}`}
                      className="view-product-btn"
                    >
                      Voir le produit
                    </Link>

                    <button
                      className="remove-btn"
                      onClick={() =>
                        removeFavorite(product._id)
                      }
                    >
                      <FaHeart />
                      Retirer
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Favorites;