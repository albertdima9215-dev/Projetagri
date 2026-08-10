import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/adminProducts.css";

function AdminProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Voulez-vous supprimer ce produit ?")) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchProducts();

    } catch (error) {
      alert(error.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="admin-products">

      <h1>Gestion des produits</h1>

      <table>

        <thead>
          <tr>
            <th>Image</th>
            <th>Produit</th>
            <th>Prix</th>
            <th>Vendeur</th>
            <th>Localisation</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {products.map((product) => (

            <tr key={product._id}>

              <td>
                <img
                  src={product.images?.[0] || product.image}
                  alt={product.nom}
                  className="admin-product-image"
                />
              </td>

              <td>{product.nom}</td>

              <td>{product.prix} FCFA</td>

              <td>{product.vendeur?.nom}</td>

              <td>{product.localisation}</td>

              <td>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteProduct(product._id)
                  }
                >
                  Supprimer
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default AdminProducts;