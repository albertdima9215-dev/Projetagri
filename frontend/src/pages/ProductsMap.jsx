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

import {
  formatUnitePluriel,
  getPrixLabel,
  getSaleTypeLabel,
  getStockLabel,
} from "../utils/productFormatters";

import "leaflet/dist/leaflet.css";
import "../css/productsMap.css";

/* =========================================================
   ICÔNE LEAFLET
   ========================================================= */

const customIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* =========================================================
   IMAGE DU PRODUIT
   ========================================================= */

const getProductImage = (product) => {
  if (
    Array.isArray(product?.images) &&
    product.images.length > 0 &&
    product.images[0]
  ) {
    return product.images[0];
  }

  if (product?.image) {
    return product.image;
  }

  return "/placeholder-product.png";
};

/* =========================================================
   PRODUITS SUR LA CARTE
   ========================================================= */

function ProductsMap() {
  const [products, setProducts] = useState([]);

  /* -------------------------------------------------------
     RÉCUPÉRATION DES PRODUITS
     ------------------------------------------------------- */

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/map");

      console.log("PRODUCTS MAP =", res.data);

      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(
        "Erreur récupération produits :",
        error
      );

      setProducts([]);
    }
  };

  /* =======================================================
     CENTRE DE LA CARTE
     ======================================================= */

  const mapCenter =
    products.length > 0 &&
    !Number.isNaN(parseFloat(products[0].latitude)) &&
    !Number.isNaN(parseFloat(products[0].longitude))
      ? [
          parseFloat(products[0].latitude),
          parseFloat(products[0].longitude),
        ]
      : [14.7167, -17.4677];

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
      }}
    >
      <MapContainer
        center={mapCenter}
        zoom={11}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        {/* =================================================
            OPEN STREET MAP
            ================================================= */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* =================================================
            MARQUEURS
            ================================================= */}

        {products.map((product, index) => {
          const lat = parseFloat(product.latitude);
          const lng = parseFloat(product.longitude);

          /* -----------------------------------------------
             Éviter les coordonnées invalides
             ----------------------------------------------- */

          if (
            Number.isNaN(lat) ||
            Number.isNaN(lng)
          ) {
            return null;
          }

          /* -----------------------------------------------
             Données formatées
             ----------------------------------------------- */

          const saleType = getSaleTypeLabel(product);

          const priceLabel = getPrixLabel(product);

          const stockLabel = getStockLabel(product);

          /* -----------------------------------------------
             Composition du lot
             ----------------------------------------------- */

          const lotQuantity = Number(
            product.quantiteParLot || 0
          );

          const lotComposition =
            product.typeVente === "lot" &&
            lotQuantity > 0
              ? `${lotQuantity} ${formatUnitePluriel(
                  product.unite,
                  lotQuantity
                )} / lot`
              : null;

          return (
            <Marker
              key={product._id}
              position={[
                lat + index * 0.0001,
                lng + index * 0.0001,
              ]}
              icon={customIcon}
            >
              {/* =================================================
                  NOM DU PRODUIT TOUJOURS VISIBLE
                  ================================================= */}

              <Tooltip
                permanent
                direction="top"
                offset={[0, -35]}
                className="product-label"
              >
                {product.nom}
              </Tooltip>

              {/* =================================================
                  POPUP
                  ================================================= */}

              <Popup maxWidth={300}>
                <div className="product-popup">

                  {/* -------------------------------------------
                      IMAGE
                      ------------------------------------------- */}

                  <img
                    src={getProductImage(product)}
                    alt={product.nom || "Produit"}
                    className="popup-image"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder-product.png";
                    }}
                  />

                  {/* -------------------------------------------
                      INFORMATIONS
                      ------------------------------------------- */}

                  <div className="popup-content">

                    {/* Nom */}

                    <h3>
                      {product.nom}
                    </h3>

                    {/* Catégorie */}

                    {product.categorie && (
                      <span className="popup-category">
                        {product.categorie}
                      </span>
                    )}

                    {/* Type de vente */}

                    {saleType && (
                      <p className="popup-info">
                        <strong>
                          Type de vente :
                        </strong>{" "}
                        {saleType}
                      </p>
                    )}

                    {/* Prix */}

                    <p className="popup-price">
                      {priceLabel}
                    </p>

                    {/* Stock */}

                    {stockLabel && (
                      <p className="popup-stock">
                        <strong>
                          Disponible :
                        </strong>{" "}
                        {stockLabel}
                      </p>
                    )}

                    {/* Composition du lot */}

                    {lotComposition && (
                      <p className="popup-info">
                        <strong>
                          Composition :
                        </strong>{" "}
                        {lotComposition}
                      </p>
                    )}

                    {/* Localisation */}

                    {product.localisation && (
                      <p className="popup-location">
                        <strong>
                          📍 Localisation :
                        </strong>{" "}
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