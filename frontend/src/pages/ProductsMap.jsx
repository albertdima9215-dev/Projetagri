import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

function ProductsMap() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/map");

      console.log("PRODUCTS =", res.data);

      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={
          products.length > 0
          ? [products[0].latitude,                       products[0].longitude]
          : [14.7167, -17.4677]
                }
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {products.map((product, index) => {
  const lat = parseFloat(product.latitude);
  const lng = parseFloat(product.longitude);

          return (
            <Marker
      key={product._id}
      position={[
        lat + index * 0.0001,
        lng + index * 0.0001,
      ]}
      icon={customIcon}
    >
              <Popup maxWidth={260}>
                <div className="product-popup">
                  <img
            src={product.image}
            alt={product.nom}
            className="popup-image"
          />

                  <h3>{product.nom}</h3>

                  <p className="popup-price">
            {product.prix.toLocaleString()} FCFA
                  </p>

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