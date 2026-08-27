import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("");
  const [localisation, setLocalisation] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [search, categorie, localisation]);

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

    setProducts(res.data.produits.slice(0, 50));
    
  } catch (error) {
    console.log(error);
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

        {products.map((product) => (

          <div className="card" key={product._id}>

            <img src={optimizeImage(product.images?.[0] || product.image, 500)} alt={product.nom} loading="lazy" decoding="async" />

            <h3>{product.nom}</h3>

            <p>{product.localisation}</p>

            <h2>{product.prix} FCFA</h2>

            {product.quantite === 0 ? (
              <span className="stock-badge out">Rupture</span>
            ) : (
              <span className="stock-badge in">En stock</span>
            )}

            <div className="product-rating">
              ⭐ {product.averageRating || 0}
              <span>({product.totalReviews || 0})</span>
            </div>

            <Link to={`/products/${product._id}`}>
              Voir les détails
            </Link>

          </div>

        ))}

      </div>

      <Features />

      <Stats />

      <Testimonials />

    </div>
  );
}

export default Home;