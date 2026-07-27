import { Link, Outlet } from "react-router-dom";
import "../css/adminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">

        <h2>AgriConnect</h2>

        <nav>

          <Link to="/admin">
            📊 Tableau de bord
          </Link>

          <Link to="/admin/users">
            👥 Utilisateurs
          </Link>

          <Link to="/admin/products">
            🌾 Produits
          </Link>

          <Link to="/admin/orders">
            📦 Commandes
          </Link>

          <Link to="/admin/payments">
            💳 Paiements
          </Link>

          <Link to="/">
            🏠 Retour au site
          </Link>

        </nav>

      </aside>

      <main className="admin-content">
        <Outlet />
      </main>

    </div>
  );
}

export default AdminLayout;