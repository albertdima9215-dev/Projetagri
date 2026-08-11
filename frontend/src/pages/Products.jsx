import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/products.css";
import {Link} from "react-router-dom";
import { FaHeart, FaRegHeart,FaWhatsapp } from "react-icons/fa";

import { useFavorite } from "../context/FavoriteContext";

function Products() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("recent");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    getProducts();
    fetchFavorites();
  }, []);

  useEffect(() => {
    setVisibleCount(12);
  }, [search, category, location, minPrice, maxPrice, sort]);
  

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

const filteredProducts = products
  .filter((product) =>
    product.nom.toLowerCase().includes(search.toLowerCase())
  )
  .filter((product) =>
    category ? product.categorie === category : true
  )
  .filter((product) =>
    location
      ? product.localisation
          .toLowerCase()
          .includes(location.toLowerCase())
      : true
  )
  .filter((product) =>
    minPrice ? product.prix >= Number(minPrice) : true
  )
  .filter((product) =>
    maxPrice ? product.prix <= Number(maxPrice) : true
  )
  .sort((a, b) => {
    if (sort === "priceAsc") return a.prix - b.prix;
    if (sort === "priceDesc") return b.prix - a.prix;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const visibleProducts = filteredProducts.slice(0, visibleCount);

const shareOnWhatsApp = (product) => {
  const url = `${window.location.origin}/products/${product._id}`;

  const text = `🌾 *${product.nom}*

💰 Prix : ${product.prix} FCFA
📍 Localisation : ${product.localisation}

Voir le produit : ${url}`;

  window.open(
    `https://wa.me/?text=${encodeURIComponent(text)}`,
    "_blank"
  );
};

if (loading) {
  return (
    <div className="products-container">
      <h1>Nos Produits</h1>

      <div className="products-grid">
        {[...Array(8)].map((_, index) => (
          <div className="product-card skeleton-card" key={index}>
            <div className="skeleton skeleton-image"></div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-price"></div>
            <div className="skeleton skeleton-button"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
  

  return (
    <div className="products-container">
      <h1>Nos Produits</h1>

      <div className="filters">

          <input
    type="text"
    placeholder="🔍 Rechercher un produit..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

          <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
  >
            <option value="">Toutes les catégories</option>
            <option value="Céréales">Céréales</option>
            <option value="Légumes">Légumes</option>
            <option value="Fruits">Fruits</option>
            <option value="Tubercules">Tubercules</option>
            <option value="Élevage">Élevage</option>
          </select>

          <input
    type="text"
    placeholder="📍 Localité"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
  />

          <input
    type="number"
    placeholder="Prix min"
    value={minPrice}
    onChange={(e) => setMinPrice(e.target.value)}
  />

          <input
    type="number"
    placeholder="Prix max"
    value={maxPrice}
    onChange={(e) => setMaxPrice(e.target.value)}
  />

          <select
    value={sort}
    onChange={(e) => setSort(e.target.value)}
  >
            <option value="recent">🆕 Plus récent</option>
            <option value="priceAsc">💰 Prix croissant</option>
            <option value="priceDesc">💰 Prix décroissant</option>
          </select>

        </div>

        <p className="results-count">
          {filteredProducts.length} produit(s) trouvé(s)
        </p>

        <button
  className="reset-filters"
  onClick={() => {
    setSearch("");
    setCategory("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setSort("recent");
  }}
>
          🔄 Réinitialiser
        </button>

      <div className="products-grid">

        {visibleCount < filteredProducts.length && (
          <div className="load-more-container">
            <button
      className="load-more-btn"
      onClick={() => setVisibleCount((prev) => prev + 12)}
    >
              ⬇ Charger plus
            </button>
          </div>
        )}
        
        {filteredProducts.length === 0 ? (
          <p>Aucun produit disponible.</p>
        ) : (
        visibleProducts.map((product) => (
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
            
            <img src={product.images?.[0] || product.image} alt={product.nom} />

            <h3>{product.nom}</h3>

            <p>{product.prix} FCFA</p>

            <div className="product-rating">
              ⭐ {product.averageRating || 0}
                  <span>({product.totalReviews || 0} avis)</span>
            </div>

            {product.quantite === 0 && (
              <span className="stock-badge out">
                Rupture
              </span>
            )}

            <Link to={`/products/${product._id}`}>
              <button className="details-btn" >
                Voir les détails
              </button>
            </Link>

            <button
  className="whatsapp-share-btn"
  onClick={() => shareOnWhatsApp(product)}
>
              <FaWhatsapp /> Partager
            </button>
            
          </div>
        )))}
      </div>
    </div>
  );
}

export default Products;