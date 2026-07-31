import { Link, Outlet } from "react-router-dom";
import "../css/adminLayout.css";

//Icons
import { FaUsers, FaProductHunt, FaHome, FaCreditCard } from "react-icons/fa";
import { GiReceiveMoney, GiCardboardBox,} from "react-icons/gi";
import { VscGraph } from "react-icons/vsc";


function AdminLayout() {
  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">

        <h2>AgriConnect</h2>

        <nav>

          <Link to="/admin">
            <VscGraph /> Tableau de bord
          </Link>

          <Link to="/admin/users">
            <FaUsers /> Utilisateurs
          </Link>

          <Link to="/admin/products">
            <FaProductHunt /> Produits
          </Link>

          <Link to="/admin/orders">
            <GiCardboardBox /> Commandes
          </Link>

          <Link to="/admin/payments">
            <FaCreditCard /> Paiements
          </Link>

          <Link to="/">
            <FaHome /> Retour au site
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