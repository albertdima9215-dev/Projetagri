import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import api from "../services/api";
import "../css/home.css";

import Hero from "../components/Hero";
import Features from "../components/Features";
import Categories from "../components/Categories";
import Stats from "../components/Stats";
import Testimonials from "../components/Testimonials";
import PromoBanner from "../components/PromoBanner";

import { optimizeImage } from "../utils/cloudinary";

import {
  getPrixLabel,
  getStockLabel,
} from "../utils/productFormatters";

function Home() {
  const [products, setProducts] = useState([]);

  // Skeleton uniquement lors du premier chargement
  const [loading, setLoading] = useState(true);

  // Indicateur discret pendant une recherche
  const [searching, setSearching] = useState(false);

  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("");
  const [localisation, setLocalisation] = useState("");

  const [favoriteIds, setFavoriteIds] = useState([]);

  // Permet de savoir si c'est le premier chargement
  const firstLoad = useRef(true);

  /* =========================================
     RÉCUPÉRATION DES PRODUITS
  ========================================= */

  const fetchProducts = async (initialLoad = false) => {
    try {
      if (initialLoad) {
        setLoading(true);
      } else {
        setSearching(true);
      }

      const res = await api.get("/products", {
        params: {
          search,
          categorie,
          localisation,
        },
      });

      console.log(
        "Produits reçus par le frontend :",
        res.data
      );

      const data = res.data?.produits || [];

      console.log(
        "Nombre de produits :",
        data.length
      );

      setProducts(data.slice(0, 50));
    } catch (error) {
      console.error(
        "Erreur récupération produits :",
        error.response?.data || error.message
      );

      // On vide seulement lors du premier chargement.
      // Pendant une recherche, on conserve les anciens produits.
      if (initialLoad) {
        setProducts([]);
      }
    } finally {
      if (initialLoad) {
        setLoading(false);
      } else {
        setSearching(false);
      }
    }
  };

  /* =========================================
     RECHERCHE AVEC DEBOUNCE
  ========================================= */

  useEffect(() => {
    const initialLoad = firstLoad.current;

    const timer = setTimeout(() => {
      fetchProducts(initialLoad);

      if (firstLoad.current) {
        firstLoad.current = false;
      }
    }, initialLoad ? 0 : 400);

    return () => {
      clearTimeout(timer);
    };
  }, [search, categorie, localisation]);

  /* =========================================
     RÉCUPÉRATION DES FAVORIS
  ========================================= */

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

  /* =========================================
     FAVORIS
  ========================================= */

  const toggleFavorite = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert(
          "Veuillez vous connecter pour ajouter un produit aux favoris."
        );
        return;
      }

      const isFavorite =
        favoriteIds.includes(productId);

      if (isFavorite) {
        await api.delete(
          `/favorites/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFavoriteIds((prev) =>
          prev.filter(
            (id) => id !== productId
          )
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
      console.error(
        "Erreur favori :",
        error
      );

      alert(
        error.response?.data?.message ||
          "Impossible de modifier les favoris."
      );
    }
  };

  /* =========================================
     SKELETON PREMIER CHARGEMENT
  ========================================= */

  if (loading) {
    return (
      <div className="home">
        <div className="hero-skeleton skeleton"></div>

        <div className="categories-skeleton">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="category-skeleton skeleton"
            ></div>
          ))}
        </div>

        <div className="products-skeleton">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="card skeleton-card"
            >
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

  /* =========================================
     PAGE HOME
  ========================================= */

  return (
    <div className="home">

      <Hero />

      <PromoBanner />

      <Categories />

      {/* =====================================
          COMMENT ÇA MARCHE
      ===================================== */}

      <div className="how-it-works">

        <h2>Comment ça marche ?</h2>

        <div className="steps">

          <div className="step">
            <div className="step-number">
              1
            </div>

            <h3>Rechercher</h3>

            <p>
              Trouvez un produit près de
              chez vous.
            </p>
          </div>

          <div className="step">
            <div className="step-number">
              2
            </div>

            <h3>Contacter</h3>

            <p>
              Discutez avec le vendeur via
              WhatsApp.
            </p>
          </div>

          <div className="step">
            <div className="step-number">
              3
            </div>

            <h3>Acheter</h3>

            <p>
              Payez et suivez votre
              commande.
            </p>
          </div>

        </div>
      </div>

      {/* =====================================
          PRODUITS VEDETTES
      ===================================== */}

      <div className="section-header">

        <div>
          <h1>Produits vedettes</h1>

          <p>
            Découvrez les produits les plus
            recherchés du moment
          </p>
        </div>

        <Link
          to="/products"
          className="see-all-btn"
        >
          Voir tout →
        </Link>

      </div>

      {/* =====================================
          FILTRES
      ===================================== */}

      <div className="filters">

        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={categorie}
          onChange={(e) =>
            setCategorie(e.target.value)
          }
        >
          <option value="">
            Toutes les catégories
          </option>

          <option value="Céréales">
            Céréales
          </option>

          <option value="Légumes">
            Légumes
          </option>

          <option value="Fruits">
            Fruits
          </option>

          <option value="Tubercules">
            Tubercules
          </option>

          <option value="Élevage">
            Élevage
          </option>
        </select>

        <input
          type="text"
          placeholder="Localisation"
          value={localisation}
          onChange={(e) =>
            setLocalisation(e.target.value)
          }
        />

      </div>

      {/* =====================================
          INDICATEUR RECHERCHE
      ===================================== */}

      {searching && (
        <div className="search-loading">
          <span className="search-spinner"></span>
          Recherche en cours...
        </div>
      )}

      {/* =====================================
          PRODUITS
      ===================================== */}

      <div className="products">

        {products.length === 0 ? (
          <p className="no-products">
            Aucun produit disponible pour
            le moment.
          </p>
        ) : (
          products.map((product) => (

            <div
              className="card"
              key={product._id}
            >

              {/* IMAGE */}

              <div className="product-image-container">

                <img
                  src={optimizeImage(
                    product.images?.[0] ||
                      product.image,
                    500
                  )}
                  alt={product.nom}
                  loading="lazy"
                  decoding="async"
                />

                {/* FAVORI */}

                <button
                  className={`favorite-btn ${
                    favoriteIds.includes(
                      product._id
                    )
                      ? "favorite-active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleFavorite(
                      product._id
                    )
                  }
                  aria-label={
                    favoriteIds.includes(
                      product._id
                    )
                      ? "Retirer des favoris"
                      : "Ajouter aux favoris"
                  }
                >
                  {favoriteIds.includes(
                    product._id
                  ) ? (
                    <FaHeart />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>

              </div>

              {/* NOM */}

              <h3>{product.nom}</h3>

              {/* LOCALISATION */}

              <p>
                {product.localisation}
              </p>

              {/* PRIX */}

              <div className="product-price">

                <h2>
                  {getPrixLabel(product)}
                </h2>

              </div>

              {/* STOCK */}

              {product.quantite === 0 ? (

                <span className="stock-badge out">
                  Rupture de stock
                </span>

              ) : (

                <span className="stock-badge in">
                  En stock
                </span>

              )}

              {/* QUANTITÉ */}

              <p className="product-quantity">
                {getStockLabel(product)}
              </p>

              {/* NOTE */}

              <div className="product-rating">

                ⭐{" "}
                {product.averageRating || 0}

                <span>
                  (
                  {product.totalReviews ||
                    0}
                  )
                </span>

              </div>

              {/* DÉTAILS */}

              <Link
                to={`/products/${product._id}`}
              >
                Voir les détails
              </Link>

            </div>

          ))
        )}

      </div>

      {/* =====================================
          FEATURES
      ===================================== */}

      <Features />

      {/* =====================================
          STATISTIQUES
      ===================================== */}

      <Stats />

      {/* =====================================
          TÉMOIGNAGES
      ===================================== */}

      <Testimonials />

    </div>
  );
}

export default Home;