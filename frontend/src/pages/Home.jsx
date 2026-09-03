import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import api from "../services/api";
import "../css/home.css";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Categories from "../components/Categories";
import Stats from "../components/Stats";
import Testimonials from "../components/Testimonials";
import { optimizeImage } from "../utils/cloudinary";
import PromoBanner from "../components/PromoBanner";

function Home() {

function formatUnite(unite) {
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
}

function getPrixLabel(product) {
  const prix = Number(product.prix || 0).toLocaleString("fr-FR");
  const unite = formatUnite(product.unite);

  if (product.typeVente === "lot") {
    const quantiteLot = Number(product.quantiteParLot || 0);

    return `${prix} FCFA / lot de ${quantiteLot} ${unite}${
      quantiteLot > 1 ? "s" : ""
    }`;
  }

  return `${prix} FCFA / ${unite}`;
}

function getStockLabel(product) {
  const quantite = Number(product.quantite || 0);

  if (quantite === 0) {
    return "Rupture de stock";
  }

  // Vente par lot
  if (product.typeVente === "lot") {
    return `${quantite} lot${quantite > 1 ? "s" : ""} disponible${
      quantite > 1 ? "s" : ""
    }`;
  }

  // Vente au poids
  if (product.typeVente === "poids") {
    const poids = product.unite;

    const poidsValeur = {
      "1kg": 1,
      "5kg": 5,
      "10kg": 10,
      "25kg": 25,
      "50kg": 50,
      "100kg": 100,
      "1tonne": 1000,
    };

    const kg = poidsValeur[poids];

    if (kg) {
      const totalKg = quantite * kg;

      return `${totalKg.toLocaleString("fr-FR")} kg disponibles`;
    }

    return `${quantite} ${formatUnite(poids)} disponibles`;
  }

  // Vente à l'unité
  const unite = formatUnite(product.unite);

  return `${quantite} ${unite}${quantite > 1 ? "s" : ""} disponibles`;
}
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [search, categorie, localisation]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      setFavoriteIds([]);
      return;
    }

    const res = await api.get("/favorites", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const ids = (res.data || [])
      .map((item) => item.produit?._id)
      .filter(Boolean);

    setFavoriteIds(ids);

  } catch (error) {
    console.error(
      "Erreur récupération favoris :",
      error.response?.data || error.message
    );
  }
};

const toggleFavorite = async (productId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Veuillez vous connecter pour ajouter un produit aux favoris.");
      return;
    }

    const isFavorite = favoriteIds.includes(productId);

    if (isFavorite) {
      await api.delete(`/favorites/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavoriteIds((prev) =>
        prev.filter((id) => id !== productId)
      );

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

      setFavoriteIds((prev) => [
        ...prev,
        productId,
      ]);
    }

  } catch (error) {
    console.error("Erreur favori :", error);

    alert(
      error.response?.data?.message ||
      "Impossible de modifier les favoris."
    );
  }
};

  const fetchProducts = async () => {
  setLoading(true);

  try {
    const res = await api.get("/products", {
      params: {
        search,
        categorie,
        localisation,
      },
    });

    console.log("Produits reçus par le frontend :", res.data);

    const data = res.data?.produits || [];

    console.log("Nombre de produits :", data.length);

    setProducts(data.slice(0, 50));

  } catch (error) {
    console.error(
      "Erreur récupération produits :",
      error.response?.data || error.message
    );

    setProducts([]);
  } finally {
    setLoading(false);
  }
};

if (loading) {
  return (
    <div className="home">
      <div className="hero-skeleton skeleton"></div>

      <div className="categories-skeleton">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="category-skeleton skeleton"></div>
        ))}
      </div>

      <div className="products-skeleton">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card skeleton-card">
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
    <div className="home">
      <Hero />

      <PromoBanner />
      
      <Categories />

      <div className="how-it-works">
        <h2>Comment ça marche ?</h2>

        <div className="steps">
          <div className="step">
          <div className="step-number">1</div>
          <h3>Rechercher</h3>
          <p>Trouvez un produit près de chez vous.</p>
        </div>

        <div className="step">
          <div className="step-number">2</div>
          <h3>Contacter</h3>
          <p>Discutez avec le vendeur via WhatsApp.</p>
        </div>

        <div className="step">
          <div className="step-number">3</div>
          <h3>Acheter</h3>
          <p>Payez et suivez votre commande.</p>
        </div>
      </div>
    </div>
      
      <div className="section-header">
        <div>
          <h1>Produits vedettes</h1>
          <p>Découvrez les produits les plus recherchés du moment</p>
        </div>

        <Link to="/products" className="see-all-btn">
          Voir tout →
        </Link>
      </div>

      <div className="filters">

        <input
    type="text"
    placeholder="Rechercher un produit..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

        <select
    value={categorie}
    onChange={(e) => setCategorie(e.target.value)}
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
    placeholder="Localisation"
    value={localisation}
    onChange={(e) => setLocalisation(e.target.value)}
  />

    </div>

      <div className="products">

  {products.length === 0 ? (
    <p className="no-products">
      Aucun produit disponible pour le moment.
    </p>
  ) : (
    products.map((product) => (

          <div className="card" key=  {product._id}>

            <div className="product-image-container">

              <img
      src={optimizeImage(
        product.images?.[0] || product.image,
        500
      )}
      alt={product.nom}
      loading="lazy"
      decoding="async"
    />

              <button
      className={`favorite-btn ${
        favoriteIds.includes(product._id)
          ? "favorite-active"
          : ""
      }`}
      onClick={() => toggleFavorite(product._id)}
      aria-label={
        favoriteIds.includes(product._id)
          ? "Retirer des favoris"
          : "Ajouter aux favoris"
      }
    >
        {favoriteIds.includes(product._id) ? (
          <FaHeart />
        ) : (
          <FaRegHeart />
        )}
      </button>

    </div>

            <h3>{product.nom}</h3>

            <p>{product.localisation}</p>

            <div className="product-price">
              <h2>
                {getPrixLabel(product)}
              </h2>
            </div>

            {product.quantite === 0 ? (
              <span className="stock-badge out">
                Rupture de stock
              </span>
            ) : (
              <span className="stock-badge in">
                En stock
              </span>
            )}

            <p className="product-quantity">
              {getStockLabel(product)}
            </p>

            <div className="product-rating">
              ⭐ {product.averageRating || 0}
              <span>({product.totalReviews || 0})</span>
            </div>

            <Link to={`/products/${product._id}`}>
              Voir les détails
            </Link>

          </div>

        ))
      )}
        
      </div>

      <Features />

      <Stats />

      <Testimonials />

    </div>
  );
}

export default Home;