import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/adminDashboard.css";
import { Link } from "react-router-dom";
import OrdersChart from "../components/admin/OrdersChart";

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

      <div className="stats-grid">

        <div className="stat-card">
          <h2>👥 Utilisateurs</h2>
          <p>{stats.totalUsers}</p>
        </div>

        <div className="stat-card">
          <h2>🌾 Produits</h2>
          <p>{stats.totalProducts}</p>
        </div>

        <div className="stat-card">
          <h2>📦 Commandes</h2>
          <p>{stats.totalOrders}</p>
        </div>

        <div className="stat-card">
          <h2>💰 Revenus</h2>
          <p>{stats.totalRevenue} FCFA</p>
        </div>

        <div className="stat-card">
          <h2>✅ Livrées</h2>
          <p>{stats.deliveredOrders}</p>
        </div>

        <div className="stat-card">
          <h2>🟡 En attente</h2>
          <p>{stats.pendingOrders}</p>
        </div>

        <div className="stat-card">
          <h2>❌ Annulées</h2>
          <p>{stats.cancelledOrders}</p>
        </div>

        <div className="chart-card">
          <OrdersChart stats={stats} />
        </div>

      </div>

      <div className="admin-menu">

        <Link to="/admin/users">
          👥 Gérer les utilisateurs
        </Link>

        <Link to="/admin/products">
          🌾 Gérer les produits
        </Link>

        <Link to="/admin/orders">
          📦 Gérer les commandes
        </Link>

        <Link to="/admin/payments">
          💳 Paiements
        </Link>

      </div>

    </div>
  );
}

export default AdminDashboard;