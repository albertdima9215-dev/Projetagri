import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const [favoriteCount, setFavoriteCount] = useState(0);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setFavoriteCount(0);
        return;
      }

      const res = await api.get("/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavoriteCount(res.data.length);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <FavoriteContext.Provider
      value={{
        favoriteCount,
        setFavoriteCount,
        fetchFavorites,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

export const useFavorite = () => useContext(FavoriteContext);