import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "../css/sellerProfile.css";

function SellerProfile() {
  const { id } = useParams();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchSeller();
  }, []);

  const fetchSeller = async () => {
    try {
      const res = await api.get(`/users/profile/${id}`);

      setSeller(res.data.vendeur);
      setProducts(res.data.produits);

    } catch (error) {
      console.log(error);
    }
  };

  if (!seller) {
    return <h2>Chargement...</h2>;
  }

  return (
    <div className="seller-profile">

      <div className="seller-header">

        <img
          src={
            seller.photo ||
            "https://via.placeholder.com/150"
          }
          alt={seller.nom}
        />

        <div>

          <h1>{seller.nom}</h1>

          <p>📍 {seller.localisation}</p>

          <p>📞 {seller.telephone}</p>

          <p>✉️ {seller.email}</p>

          <p>{seller.bio}</p>

        </div>

      </div>

      <h2>Produits publiés</h2>

      <div className="seller-products">

        {products.map((product) => (

          <div
            className="product-card"
            key={product._id}
          >

            <img
              src={product.images?.[0] || product.image}
              alt={product.nom}
            />

            <h3>{product.nom}</h3>

            <p>{product.prix} FCFA</p>

            <Link to={`/products/${product._id}`}>
              Voir le produit
            </Link>

          </div>

        ))}

      </div>

    </div>
  );
}

export default SellerProfile;