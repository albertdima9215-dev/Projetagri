import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBoxOpen,
  FaHeart,
  FaShoppingBag,
  FaUser,
} from "react-icons/fa";

import "../css/bottomNav.css";

function BottomNav() {
  const user = JSON.parse(localStorage.getItem("user"));

  
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <FaHome />
        <span>Accueil</span>
      </NavLink>

      <NavLink
        to="/products"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <FaBoxOpen />
        <span>Produits</span>
      </NavLink>

      <NavLink
        to="/favorites"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <FaHeart />
        <span>Favoris</span>
      </NavLink>

      <NavLink
        to="/my-orders"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <FaShoppingBag />
        <span>Commandes</span>
      </NavLink>

      <NavLink
  to={user ? `/seller/${user.id}` : "/login"}
  className={({ isActive }) =>
    isActive ? "nav-item active" : "nav-item"
  }
>
        <FaUser />
        <span>Profil</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;