import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "../services/api";
import "../css/sellersMap.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function SellersMap() {
  const [sellers, setSellers] = useState([]);
  const [radius, setRadius] = useState(20);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      setUserPosition([
        position.coords.latitude,
        position.coords.longitude,
      ]);
    });
  }
}, []);

  const fetchSellers = async () => {
    try {
      const res = await api.get("/users/sellers-location");

      console.log("SELLERS =", res.data);
      
      setSellers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const nearbySellers = sellers
  .map((seller) => {
    if (!userPosition) {
      return seller;
    }

    const distance = calculateDistance(
      userPosition[0],
      userPosition[1],
      seller.latitude,
      seller.longitude
    );

    return {
      ...seller,
      distance,
    };
  })
  .filter(
    (seller) =>
      seller.latitude !== null &&
      seller.longitude !== null &&
      (!seller.distance || seller.distance <= radius)
  );

  return (
    <>
    <div className="radius-filter">
      <button
    className={radius === 10 ? "active" : ""}
    onClick={() => setRadius(10)}
  >
        10 km
      </button>

      <button
    className={radius === 20 ? "active" : ""}
    onClick={() => setRadius(20)}
  >
        20 km
      </button>

      <button
    className={radius === 50 ? "active" : ""}
    onClick={() => setRadius(50)}
  >
        50 km
      </button>
    </div>
    
    <div style={{ height: "80vh", width: "100%" }}>
      <MapContainer
        center={[14.7167, -17.4677]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {nearbySellers.map((seller) => (
          <Marker
  key={seller._id}
  position={[
    parseFloat(seller.latitude),
    parseFloat(seller.longitude),
  ]}
>
            <Popup>
              <div>
                <h3>{seller.nom}</h3>
                <p>📞 {seller.telephone}</p>
                {seller.distance && seller.distance > 0.1 && (
                  <>
                    <p>📏                                      {seller.distance.toFixed(1)} km
                    </p>
                    <p>🚚 ~                                     {Math.round(seller.distance * 75)} FCFA
                    </p>
                  </>
                )}
                <a
                  href={`https://wa.me/226${seller.telephone}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Contacter sur WhatsApp
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
    </>
  );
}

export default SellersMap;