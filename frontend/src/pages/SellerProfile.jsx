import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "../css/sellerProfile.css";

// Formatage des produits
import {
  getPrixLabel,
  getSaleTypeLabel,
  getStockLabel,
} from "../utils/productFormatters";

// Icons
import {
  FaMapPin,
  FaPhoneAlt,
} from "react-icons/fa";
import { MdAttachEmail } from "react-icons/md";

function SellerProfile() {
  const { id } = useParams();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchSeller();
  }, [id]);

  const fetchSeller = async () => {
    try {
      const res = await api.get(`/users/profile/${id}`);

      setSeller(res.data.vendeur);
      setProducts(res.data.produits || []);
    } catch (error) {
      console.log(error);
    }
  };

  if (!seller) {
    return (
      <div className="seller-loading">
        <h2>Chargement...</h2>
      </div>
    );
  }

  return (
    <div className="seller-profile">

      {/* =========================
          INFORMATIONS DU VENDEUR
      ========================= */}

      <div className="seller-header">

        <div className="seller-photo-container">
          <img
            src={
              seller.photo ||
              "https://via.placeholder.com/150"
            }
            alt={seller.nom}
            className="seller-photo"
          />
        </div>

        <div className="seller-info">

          <h1>{seller.nom}</h1>

          {seller.localisation && (
            <p>
              <FaMapPin />
              <span>{seller.localisation}</span>
            </p>
          )}

          {seller.telephone && (
            <p>
              <FaPhoneAlt />
              <span>{seller.telephone}</span>
            </p>
          )}

          {seller.email && (
            <p>
              <MdAttachEmail />
              <span>{seller.email}</span>
            </p>
          )}

          {seller.bio && (
            <p className="seller-bio">
              {seller.bio}
            </p>
          )}

        </div>

      </div>

      {/* =========================
          PRODUITS
      ========================= */}

      <div className="seller-products-section">

        <div className="products-title">

          <h2>
            Produits publiés
          </h2>

          <span>
            {products.length} produit
            {products.length > 1 ? "s" : ""}
          </span>

        </div>

        {products.length === 0 ? (

          <div className="no-products">
            <p>
              Ce vendeur n'a encore publié
              aucun produit.
            </p>
          </div>

        ) : (

          <div className="seller-products">

            {products.map((product) => (

              <div
                className="product-card"
                key={product._id}
              >

                {/* IMAGE */}

                <div className="product-image-container">

                  <img
                    src={
                      product.images?.[0] ||
                      product.image
                    }
                    alt={product.nom}
                  />

                </div>

                {/* INFORMATIONS */}

                <div className="product-card-content">

                  <h3>
                    {product.nom}
                  </h3>

                  {/* TYPE DE VENTE */}

                  {getSaleTypeLabel(product) && (
                    <span className="product-sale-type">
                      {getSaleTypeLabel(product)}
                    </span>
                  )}

                  {/* PRIX */}

                  <p className="product-price">
                    {getPrixLabel(product)}
                  </p>

                  {/* STOCK */}

                  <p className="product-stock">
                    {getStockLabel(product)}
                  </p>

                  {/* BOUTON */}

                  <Link
                    to={`/products/${product._id}`}
                    className="view-product-btn"
                  >
                    Voir le produit
                  </Link>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default SellerProfile;