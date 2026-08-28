import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/adminDashboard.css";
import { Link } from "react-router-dom";
import OrdersChart from "../components/admin/OrdersChart";

//Icons
import { FaUsers, FaProductHunt, FaCheckSquare, FaCreditCard, FaGift, } from "react-icons/fa";
import { GiReceiveMoney, GiCardboardBox, GiCancel,GiTakeMyMoney,} from "react-icons/gi";
import { CiNoWaitingSign } from "react-icons/ci";
import { BsBuildingsFill } from "react-icons/bs";
import { MdWatchLater,MdDeleteForever, } from "react-icons/md";


function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="admin-dashboard">

      <h1>Tableau de bord Administrateur</h1>

      <div className="activity-card">
        <h2><MdWatchLater /> Activité récente</h2>

        <div className="activity-item">
          <span><FaUsers /> Nouvel utilisateur inscrit</span>
          <small>Il y a 5 min</small>
        </div>

        <div className="activity-item">
          <span><GiCardboardBox/> Nouvelle commande passée</span>
          <small>Il y a 12 min</small>
        </div>

        <div className="activity-item">
          <span><GiTakeMyMoney /> Paiement confirmé</span>
          <small>Aujourd'hui</small>
        </div>

        <div className="activity-item">
          <span><MdDeleteForever /> Produit supprimé par l'admin</span>
          <small>Aujourd'hui</small>
        </div>
      </div>
      
      <div className="stats-grid">

        <div className="stat-card">
          <h2><FaUsers /> Utilisateurs</h2>
          <p>{stats.totalUsers}</p>
        </div>

        <div className="stat-card">
          <h2><BsBuildingsFill /> Vendeurs</h2>
          <p>{stats.totalSellers}</p>
        </div>

        <div className="stat-card">
          <h2><FaProductHunt /> Produits</h2>
          <p>{stats.totalProducts}</p>
        </div>

        <div className="stat-card">
          <h2><GiCardboardBox /> Commandes</h2>
          <p>{stats.totalOrders}</p>
        </div>

        <div className="stat-card">
          <h2><GiReceiveMoney /> Revenus</h2>
          <p>{stats.totalRevenue?.toLocaleString('fr-FR')} FCFA</p>
        </div>

        <div className="stat-card">
          <h2><FaCheckSquare /> Livrées</h2>
          <p>{stats.deliveredOrders}</p>
        </div>

        <div className="stat-card">
          <h2><CiNoWaitingSign /> En attente</h2>
          <p>{stats.pendingOrders}</p>
        </div>

        <div className="stat-card">
          <h2><GiCancel /> Annulées</h2>
          <p>{stats.cancelledOrders}</p>
        </div>

        <div className="chart-card">
          <OrdersChart stats={stats} />
        </div>

      </div>

      <div className="admin-menu">

        <Link to="/admin/users">
          <FaUsers /> Gérer les utilisateurs
        </Link>

        <Link to="/admin/products">
          <FaProductHunt /> Gérer les produits
        </Link>

        <Link to="/admin/orders">
          <GiCardboardBox /> Gérer les commandes
        </Link>

        <Link to="/admin/payments">
          <FaCreditCard /> Paiements
        </Link>

        <Link to="/admin/promotions">
          <FaGift /> Promotions
        </Link>

      </div>

    </div>
  );
}

export default AdminDashboard;