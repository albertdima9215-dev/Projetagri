import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../css/home.css";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Categories from "../components/Categories";
import Stats from "../components/Stats";
import Testimonials from "../components/Testimonials";

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
  try {
    const res = await api.get("/products", {
      params: {
        search,
        categorie,
        localisation,
      },
    });

    setProducts(res.data.produits);
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return <h2 className="loading">Chargement...</h2>;
  }

  return (
    <div className="home">
      <Hero />
      <Categories />
      <h1>Produits agricoles</h1>

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

            <img src={product.images?.[0] || product.image} alt={product.nom} />

            <h3>{product.nom}</h3>

            <p>{product.localisation}</p>

            <h2>{product.prix} FCFA</h2>

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