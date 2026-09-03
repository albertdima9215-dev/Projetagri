import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
} from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import api from "../services/api";
import "leaflet/dist/leaflet.css";
import "../css/productsMap.css";

const customIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// --------------------------------------------------
// Image du produit
// --------------------------------------------------
const getProductImage = (product) => {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }

  if (product.image) {
    return product.image;
  }

  return "/placeholder-product.png";
};

// --------------------------------------------------
// Type de vente
// --------------------------------------------------
const getSaleTypeLabel = (product) => {
  switch (product.typeVente) {
    case "poids":
      return "Au poids";

    case "unite":
      return "À l'unité";

    case "lot":
      return "Par lot";

    default:
      return null;
  }
};

// --------------------------------------------------
// Quantité disponible
// --------------------------------------------------
const getStockLabel = (product) => {
  const quantite = Number(product.quantite);

  if (Number.isNaN(quantite)) {
    return null;
  }

  if (product.typeVente === "lot") {
    return `${quantite.toLocaleString("fr-FR")} lot${
      quantite > 1 ? "s" : ""
    }`;
  }

  if (product.unite) {
    return `${quantite.toLocaleString("fr-FR")} × ${product.unite}`;
  }

  return quantite.toLocaleString("fr-FR");
};

function ProductsMap() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/map");

      console.log("PRODUCTS MAP =", res.data);

      setProducts(res.data);
    } catch (error) {
      console.log("Erreur récupération produits :", error);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
      }}
    >
      <MapContainer
        center={
          products.length > 0
            ? [
                parseFloat(products[0].latitude),
                parseFloat(products[0].longitude),
              ]
            : [14.7167, -17.4677]
        }
        zoom={15}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {products.map((product, index) => {
          const lat = parseFloat(product.latitude);
          const lng = parseFloat(product.longitude);

          // Évite les marqueurs invalides
          if (Number.isNaN(lat) || Number.isNaN(lng)) {
            return null;
          }

          return (
            <Marker
              key={product._id}
              position={[
                lat + index * 0.0001,
                lng + index * 0.0001,
              ]}
              icon={customIcon}
            >
              {/* ---------------------------------- */}
              {/* Nom du produit toujours visible */}
              {/* ---------------------------------- */}
              <Tooltip
                permanent
                direction="top"
                offset={[0, -35]}
                className="product-label"
              >
                {product.nom}
              </Tooltip>

              {/* ---------------------------------- */}
              {/* Fenêtre au clic */}
              {/* ---------------------------------- */}
              <Popup maxWidth={280}>
                <div className="product-popup">
                  {/* Image */}
                  <img
                    src={getProductImage(product)}
                    alt={product.nom}
                    className="popup-image"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder-product.png";
                    }}
                  />

                  {/* Nom */}
                  <h3>{product.nom}</h3>

                  {/* Type de vente */}
                  {getSaleTypeLabel(product) && (
                    <p>
                      <strong>Type de vente :</strong>{" "}
                      {getSaleTypeLabel(product)}
                    </p>
                  )}

                  {/* Prix */}
                  <p className="popup-price">
                    {Number(product.prix).toLocaleString(
                      "fr-FR"
                    )}{" "}
                    FCFA
                    {product.unite && (
                      <span> / {product.unite}</span>
                    )}
                  </p>

                  {/* Stock disponible */}
                  {getStockLabel(product) && (
                    <p>
                      <strong>Disponible :</strong>{" "}
                      {getStockLabel(product)}
                    </p>
                  )}

                  {/* Composition du lot */}
                  {product.typeVente === "lot" &&
                    product.quantiteParLot && (
                      <p>
                        <strong>Composition :</strong>{" "}
                        {product.quantiteParLot} unités / lot
                      </p>
                    )}

                  {/* Localisation */}
                  {product.localisation && (
                    <p>
                      <strong>📍 Localisation :</strong>{" "}
                      {product.localisation}
                    </p>
                  )}

                  {/* Bouton */}
                  <Link
                    to={`/products/${product._id}`}
                    className="popup-btn"
                  >
                    👁 Voir le produit
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default ProductsMap;