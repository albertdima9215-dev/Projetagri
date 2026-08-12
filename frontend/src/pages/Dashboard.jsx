import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/dashboard.css";
import {Link} from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

//Icons
import { FaDollarSign,FaMapMarkedAlt, FaCar, } from "react-icons/fa";
import { GiCardboardBox } from "react-icons/gi";
import { IoMdCube } from "react-icons/io";
import { GoGraph } from "react-icons/go";
import { optimizeImage } from "../utils/cloudinary";


function Dashboard() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    chartData: [],
    averageRating: 0,
    totalReviews: 0,
    latestReviews: [],
});

  useEffect(() => {
    fetchMyProducts();
    fetchStats();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/products/mes-produits", {
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

      await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchMyProducts();
      alert("Produit supprimé avec succès");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({
    ...product,
    });

    setImages([]);
  };

  const handleEditChange = (e) => {
    setEditingProduct({
    ...editingProduct,
    [e.target.name]: e.target.value,
    });
  };

  const updateProduct = async (e) => {
  e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const data = new FormData();

    data.append("nom", editingProduct.nom);
    data.append("description", editingProduct.description);
    data.append("categorie", editingProduct.categorie);
    data.append("prix", editingProduct.prix);
    data.append("quantite", editingProduct.quantite);
    data.append("localisation", editingProduct.localisation);

      if (images.length > 0) {
        images.forEach((img) => {
        data.append("images", img);
        });
      }

      await     api.put(`/products/${editingProduct._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Produit modifié avec succès");

      setEditingProduct(null);

      setImages([]);

      fetchMyProducts();

    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la modification");
    }
  };

  const totalProducts = products.length;

const totalValue = products.reduce(
  (total, product) => total + product.prix * product.quantite,
  0
);

const totalLocations = new Set(
  products.map((product) => product.localisation)
).size;

const fetchStats = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.get("/orders/seller-stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setStats({
      totalRevenue: res.data.totalRevenue || 0,
      totalOrders: res.data.totalOrders || 0,
      deliveredOrders: res.data.deliveredOrders || 0,
      chartData: res.data.chartData || [],
      averageRating: res.data.averageRating || 0,
      totalReviews: res.data.totalReviews || 0,
      latestReviews: res.data.latestReviews || [],
    });
    
  } catch (error) {
    console.log(error);
  }
};

const filesModification = async () =>{
  try{
    const file = e.target.files[0];

    if (!file) return;

    const compressed = await                      imageCompression(file, {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    });

    setImages(compressed);
  } catch (error) {
    console.log(error)
  }
}
  

  return (
    <div className="dashboard">
      <h1>Mon tableau de bord</h1>
      <Link className="add-btn" to="/add-product">
        + Publier un produit
      </Link>
      <Link
  to="/edit-profile"
  className="edit-profile-btn"
>
        Modifier mon profil
      </Link>
      <Link to="/seller-orders">
         Commandes reçues
      </Link>

      <Link to="/seller-payments" className="dashboard-btn">
        Paiements reçus
      </Link>
      
      {products.length === 0 ? (
        <p>Vous n'avez publié aucun produit.</p>
      ) : (
      <>
        <div className="stats-grid">
          <div className="stat-card">
            <h3><FaDollarSign /> Revenus</h3>
            <p>{stats.totalRevenue.toLocaleString()} FCFA</p>
          </div>

          <div className="stat-card">
            <h3><IoMdCube /> Commandes</h3>
            <p>{stats.totalOrders}</p>
          </div>

          <div className="stat-card">
            <h3><FaCar /> Livrées</h3>
            <p>{stats.deliveredOrders}</p>
          </div>

          <div className="stat-card">
            <h3>⭐ Note moyenne</h3>
            <p>{stats.averageRating}/5</p>
            <small>{stats.totalReviews} avis</small>
          </div>
          
        </div>
        
        <div className="stats">

          <div className="stat-card">
            <h2><GiCardboardBox /></h2>
            <h3>{totalProducts}</h3>
            <p>Produits</p>
          </div>

          <div className="stat-card">
            <h2><FaDollarSign /></h2>
            <h3>{totalValue.toLocaleString()} FCFA</h3>
            <p>Valeur totale</p>
          </div>

          <div className="stat-card">
            <h2><FaMapMarkedAlt /></h2>
            <h3>{totalLocations}</h3>
            <p>Localités</p>
          </div>

        </div>

        <div className="chart-card">
          <h2><GoGraph /> Ventes par mois</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.chartData}>
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Line
        type="monotone"
        dataKey="ventes"
        stroke="#2e7d32"
        strokeWidth={3}
      />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="reviews-card">
          <h2>⭐ Derniers avis reçus</h2>

  {stats.latestReviews.length === 0 ? (
          <p>Aucun avis reçu pour le moment.</p>
          ) : (
    (stats.latestReviews || []).map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <strong>{review.acheteur?.nom || "Utilisateur"}</strong>
                <span>{"⭐".repeat(Math.round(review.note || 0))}</span>
              </div>

              <p>{review.commentaire || "Aucun commentaire"}</p>

              <small>
                {new Date(review.createdAt).toLocaleDateString("fr-FR")}
              </small>
            </div>
            ))
          )}
        </div>
        
        <div className="dashboard-products">
          {products.map((product) => (
          <div className="dashboard-card" key={product._id}>
            <img src={optimizeImage(product.images?.[0] || product.image, 400)} alt={product.nom} loading="lazy" decoding="async" />

            <h3>{product.nom}</h3>

            <span className="badge">
    {product.categorie}
            </span>

            <p>{product.prix} FCFA</p>

            <p>
              Publié le{" "}
              {new                 Date(product.createdAt).toLocaleDateString("fr-FR")}
            </p>

            <p>{product.localisation}</p>

            <div className="actions">
              <button className="btn-modifier" onClick={() => handleEdit(product)}>
                Modifier
              </button>

              <button onClick={() => deleteProduct(product._id)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
      </>
    )}
      

      {editingProduct && (
  <form className="edit-form" onSubmit={updateProduct}>

    <h2>Modifier le produit</h2>

    <input
      type="text"
      name="nom"
      value={editingProduct.nom}
      onChange={handleEditChange}
    />

    <textarea
      name="description"
      value={editingProduct.description}
      onChange={handleEditChange}
    />

    <input
      type="text"
      name="categorie"
      value={editingProduct.categorie}
      onChange={handleEditChange}
    />

    <input
      type="number"
      name="prix"
      value={editingProduct.prix}
      onChange={handleEditChange}
    />

    <input
      type="number"
      name="quantite"
      value={editingProduct.quantite}
      onChange={handleEditChange}
    />

    <input
      type="text"
      name="localisation"
      value={editingProduct.localisation}
      onChange={handleEditChange}
    />

    <input
      type="file"
      accept="image/*"
      multiple
      onChange={(e) => filesModification(e)}
    />

    <div className="edit-actions">
      <button type="submit">Enregistrer</button>

      <button
        type="button"
        onClick={() => setEditingProduct(null)}
      >
        Annuler
      </button>
    </div>

  </form>
)}
    </div>
  );
}

export default Dashboard;