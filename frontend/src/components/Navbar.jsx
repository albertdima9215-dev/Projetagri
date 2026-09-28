import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import api from "../services/api";
import socket from "../services/socket";

import "../css/navbar.css";

import { useFavorite } from "../context/FavoriteContext";

// Icons
import { FaUser } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const navRef = useRef(null);
  const notificationRef = useRef(null);

  const token = localStorage.getItem("token");

  // ==================================================
  // UTILISATEUR CONNECTÉ
  // ==================================================

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // ==================================================
  // FAVORIS
  // ==================================================

  const { favoriteCount } = useFavorite();

  // ==================================================
  // RÉCUPÉRER LES NOTIFICATIONS
  // ==================================================

  const fetchNotifications = async () => {
    try {
      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        setNotifications([]);
        return;
      }

      const res = await api.get("/notifications", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      setNotifications(
        Array.isArray(res.data) ? res.data : []
      );
    } catch (error) {
      console.error(
        "Erreur récupération notifications :",
        error
      );
    }
  };

  // ==================================================
  // CHARGEMENT INITIAL
  // ==================================================

  useEffect(() => {
    if (token) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [token]);

  // ==================================================
  // NOTIFICATION SOCKET.IO
  // ==================================================

  useEffect(() => {
    const handleNewNotification = (notification) => {
      console.log(
        "🔔 Nouvelle notification Navbar :",
        notification
      );

      if (!notification?._id) {
        return;
      }

      setNotifications((prev) => {
        const alreadyExists = prev.some(
          (n) => n._id === notification._id
        );

        if (alreadyExists) {
          return prev;
        }

        return [
          {
            ...notification,
            lu: false,
          },
          ...prev,
        ];
      });
    };

    socket.on(
      "newNotification",
      handleNewNotification
    );

    return () => {
      socket.off(
        "newNotification",
        handleNewNotification
      );
    };
  }, []);

  // ==================================================
  // CLIC EN DEHORS DU NAVBAR
  // ==================================================

  useEffect(() => {
    const handleClick = (event) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener(
        "click",
        handleClick
      );
    };
  }, []);

  // ==================================================
  // CLIC EN DEHORS DES NOTIFICATIONS
  // ==================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ==================================================
  // NOTIFICATIONS NON LUES
  // ==================================================

  const unreadCount = notifications.filter(
    (notification) => !notification.lu
  ).length;

  // ==================================================
  // OUVRIR / FERMER LES NOTIFICATIONS
  // ==================================================

  const toggleNotifications = (event) => {
    event.stopPropagation();

    setShowNotifications((prev) => !prev);
  };

  // ==================================================
  // MARQUER UNE NOTIFICATION COMME LUE
  // ==================================================

  const handleNotificationClick = async (
    event,
    notification
  ) => {
    // Empêche le clic de remonter
    event.stopPropagation();

    try {
      const currentToken =
        localStorage.getItem("token");

      if (!currentToken) {
        setShowNotifications(false);
        return;
      }

      // Marquer comme lue
      if (
        !notification.lu &&
        notification._id
      ) {
        await api.put(
          `/notifications/${notification._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );

        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id
              ? {
                  ...n,
                  lu: true,
                }
              : n
          )
        );
      }
    } catch (error) {
      console.error(
        "Erreur marquage notification :",
        error
      );
    } finally {
      // Toujours fermer le popup
      setShowNotifications(false);
    }
  };

  // ==================================================
  // VOIR TOUTES LES NOTIFICATIONS
  // ==================================================

  const handleViewAllNotifications = (
    event
  ) => {
    event.stopPropagation();

    // Fermer le popup
    setShowNotifications(false);

    // Aller vers la page notifications
    navigate("/notifications");
  };

  // ==================================================
  // DÉCONNEXION
  // ==================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setNotifications([]);
    setShowNotifications(false);
    setMenuOpen(false);

    window.location.href = "/";
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <nav
      className="navbar"
      ref={navRef}
    >
      {/* ==================================================
          LOGO
      ================================================== */}

      <div className="logo-container">
        <div className="logo">
          <Link to="/">
            AgriConnect
          </Link>
        </div>
      </div>

      {/* ==================================================
          MENU
      ================================================== */}

      <div className="nav-sidebar">
        <div
          className="menu-icon"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
        >
          {menuOpen ? "✖" : "☰"}
        </div>

        <ul
          className={
            menuOpen
              ? "nav-links active"
              : "nav-links"
          }
        >
          {/* ACCUEIL */}

          <li>
            <Link
              to="/"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Accueil
            </Link>
          </li>

          {/* PRODUITS */}

          <li>
            <Link
              to="/products"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Produits
            </Link>
          </li>

          {token ? (
            <>
              {/* ==================================================
                  FAVORIS
              ================================================== */}

              <li>
                <Link
                  to="/favorites"
                  className="favorite-link"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  Favoris

                  {favoriteCount > 0 && (
                    <span className="favorite-badge">
                      {favoriteCount}
                    </span>
                  )}
                </Link>
              </li>

              {/* ==================================================
                  NOTIFICATIONS
              ================================================== */}

              <li>
                <div
                  ref={notificationRef}
                  className="notification-menu"
                >
                  {/* BOUTON POUR OUVRIR LE POPUP */}

                  <button
                    type="button"
                    className="notification-trigger"
                    onClick={toggleNotifications}
                  >
                    Notifs

                    {unreadCount > 0 && (
                      <span className="notification-badge">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* POPUP */}

                  {showNotifications && (
                    <div
                      className="notification-dropdown"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >
                      {notifications.length ===
                      0 ? (
                        <p>
                          Aucune notification
                        </p>
                      ) : (
                        notifications
                          .slice(0, 5)
                          .map(
                            (notification) => (
                              <Link
                                key={
                                  notification._id
                                }
                                to={
                                  notification.lien ||
                                  "/notifications"
                                }
                                className={`dropdown-item ${
                                  !notification.lu
                                    ? "unread"
                                    : ""
                                }`}
                                onClick={(event) =>
                                  handleNotificationClick(
                                    event,
                                    notification
                                  )
                                }
                              >
                                <strong>
                                  {
                                    notification.titre
                                  }
                                </strong>

                                <p>
                                  {
                                    notification.message
                                  }
                                </p>
                              </Link>
                            )
                          )
                      )}

                      {/* VOIR TOUT */}

                      <button
                        type="button"
                        className="view-all"
                        onClick={
                          handleViewAllNotifications
                        }
                      >
                        Voir toutes les notifications
                      </button>
                    </div>
                  )}
                </div>
              </li>

              {/* ==================================================
                  COMMANDES
              ================================================== */}

              <li>
                <Link
                  to="/my-orders"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  Commandes
                </Link>
              </li>

              {/* ==================================================
                  PAIEMENTS
              ================================================== */}

              <li>
                <Link
                  to="/my-payments"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  Paiements
                </Link>
              </li>

              {/* ==================================================
                  DÉCONNEXION
              ================================================== */}

              <li>
                <button
                  className="logoutbtn"
                  onClick={logout}
                >
                  Déconnexion
                </button>
              </li>

              {/* ==================================================
                  DASHBOARD
              ================================================== */}

              <li>
                <Link
                  to="/dashboard"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  Dashboard
                </Link>
              </li>

              {/* ==================================================
                  PROFIL
              ================================================== */}

              <li>
                <NavLink
                  to={
                    user
                      ? `/seller/${
                          user.id ||
                          user._id
                        }`
                      : "/login"
                  }
                  className={({ isActive }) =>
                    isActive
                      ? "nav-item active"
                      : "nav-item"
                  }
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  <FaUser />

                  <span>
                    Profil
                  </span>
                </NavLink>
              </li>
            </>
          ) : (
            <>
              {/* CONNEXION */}

              <li>
                <Link
                  to="/login"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  Connexion
                </Link>
              </li>

              {/* INSCRIPTION */}

              <li>
                <Link
                  to="/register"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  Inscription
                </Link>
              </li>
            </>
          )}

          {/* ==================================================
              ADMINISTRATION
          ================================================== */}

          {user?.role === "admin" && (
            <li>
              <Link
                to="/admin"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Administration
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;