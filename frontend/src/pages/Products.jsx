import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/products.css";
import {Link} from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";

import { useFavorite } from "../context/FavoriteContext";

function Products() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    getProducts();
    fetchFavorites();
  }, []);

  async function getProducts() {
    try {
      const res = await api.get("/products");
      setProducts(res.data.produits);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const { fetchFavorites } = useFavorite();

  const toggleFavorite = async (productId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Veuillez vous connecter.");
      return;
    }

    if (favorites.includes(productId)) {

      await api.delete(`/favorites/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavorites(favorites.filter(id => id !== productId));

    } else {

      await api.post(
        `/favorites/${productId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFavorites([...favorites, productId]);
    }

  } catch (error) {
    alert(error.response?.data?.message || "Erreur");
  }
};

  fetchFavorites();

  if (loading) {
    return <h2>Chargement des produits...</h2>;
  }

  return (
    <div className="products-container">
      <h1>Nos Produits</h1>

      <div className="products-grid">
        {products.length === 0 ? (
          <p>Aucun produit disponible.</p>
        ) : (
  products.map((product) => (
          <div className="product-card" key={product._id}>

            <button
  className="favorite-btn"
  onClick={() => toggleFavorite(product._id)}
>
  {favorites.includes(product._id) ? (
    <FaHeart />
  ) : (
    <FaRegHeart />
  )}
              </button>
            
            <img src={product.image} alt={product.nom} />

            <h3>{product.nom}</h3>

            <p>{product.prix} FCFA</p>

            <Link to={`/products/${product._id}`}>
              <button className="details-btn" >
                Voir les détails
              </button>
            </Link>
          </div>
        )))}
      </div>
    </div>
  );
}

export default Products;