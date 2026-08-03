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
        center={[14.7219687, -17.4732815]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marqueur fixe de test */}
        <Marker
          position={[14.7219687, -17.4732815]}
          icon={customIcon}
        >
          <Popup>Test fixe</Popup>
        </Marker>

        {/* Marqueurs des produits */}
        {products.map((product) => (
  <Marker
    key={product._id}
    position={[
      product.latitude,
      product.longitude
    ]}
  >
    <Popup>
      <h3>{product.nom}</h3>
      <p>{product.prix} FCFA</p>
      <img 
        src={product.image}
        width="100"
        alt={product.nom}
      />
    </Popup>
  </Marker>
))}
      </MapContainer>
    </div>
  );
}

export default ProductsMap;