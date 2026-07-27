import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../css/favorites.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";

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
      alert(error.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="favorites">

      <h1><FaHeart/> Mes favoris</h1>

      {favorites.length === 0 ? (
        <p>Vous n'avez aucun favori.</p>
      ) : (
        <div className="favorites-grid">

          {favorites.map((item) => (

            <div className="favorite-card" key={item._id}>

              <img
                src={item.produit.image}
                alt={item.produit.nom}
              />

              <h3>{item.produit.nom}</h3>

              <p>{item.produit.prix} FCFA</p>

              <p>{item.produit.localisation}</p>

              <Link to={`/products/${item.produit._id}`}>
                Voir le produit
              </Link>

              <button
                onClick={() => removeFavorite(item.produit._id)}
              >
                Retirer ❤️
              </button>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default Favorites;