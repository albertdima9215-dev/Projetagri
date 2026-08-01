import { useState,useEffect,useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../css/navbar.css";
import { useFavorite } from "../context/FavoriteContext";


function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    function handleClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user"));
  
  const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/";
  };

  const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) return;

    const res = await api.get("/notifications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setNotifications(res.data);

  } catch (error) {
    console.log(error);
  }
};

  const { favoriteCount } = useFavorite();

  const notificationRef = useRef(null);

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
      setShowNotifications(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  const user = JSON.parse(localStorage.getItem("user"));

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, []);

  const unreadCount = notifications.filter(
  (n) => !n.lu
).length;

  return (
    <nav className="navbar" ref={navRef} >
      <div className="logo">
        <Link to="/"><img className="logoImg" src="/logo2.jpg" alt="logo" /> AgriConnect Faso</Link>
      </div>

      <div
  className="menu-icon"
  onClick={() => setMenuOpen(!menuOpen)}
>
        {menuOpen ? "✖" : "☰"}
      </div>

      <ul className={menuOpen ? "nav-links active" : "nav-links"}>
        <li>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Acceuil
          </Link>
        </li>

        <li>
          <Link to="/products" onClick={() => setMenuOpen(false)}>
            Produits
          </Link>
        </li>
        
        {token ? (
        <>
          <li>
            <Link to="/favorites" className="favorite-link">
              Favoris
              {favoriteCount > 0 && (
              <span className="favorite-badge">
                {favoriteCount}
              </span>
              )}
            </Link>
          </li>

          <li>
            <div
  ref={notificationRef}
  className="notification-menu"
  onClick={() => setShowNotifications(!showNotifications)}
>
              Notifs
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount}
                </span>
              )}

              {showNotifications && (
                <div className="notification-dropdown">

                  {notifications.length === 0 ? (
                    <p>Aucune notification</p>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                    <Link
  key={notification._id}
  to={notification.lien || "/notifications"}
  className="dropdown-item"
  onClick={() => setShowNotifications(false)}
>
                      <strong>{notification.titre}</strong>

                      <p>                                            {notification.message}
                      </p>
                    </Link>
                  ))
                )}

                <Link
        to="/notifications"
        className="view-all" onClick={() => setShowNotifications(false)}
      >
                  Voir toutes les notifications
                </Link>

              </div>
            )}

            </div>
          </li>

          <li>
            <Link to="/my-orders">
               Commandes
            </Link>
          </li>

          <li>
            <button className="logoutbtn" onClick={logout}>Déconnexion</button>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
        </>
        ) : (
        <>
          <li>
            <Link to="/login">Connexion</Link>
          </li>

          <li>
            <Link to="/register">Inscription</Link>
          </li>
        </>
        )}
        {user?.role === "admin" && (
          <li>
            <Link to="/admin">
              Administration
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}

export default Navbar;