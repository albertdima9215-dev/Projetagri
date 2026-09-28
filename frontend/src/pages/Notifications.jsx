import { useEffect, useState } from "react";
import api from "../services/api";
import socket from "../services/socket";
import "../css/notifications.css";

// Icons
import { GiCardboardBox } from "react-icons/gi";
import {
  FaHeart,
  FaCar,
  FaCheck,
} from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { IoIosNotifications } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  // ==================================================
  // RÉCUPÉRER LES NOTIFICATIONS
  // ==================================================

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await api.get("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
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
    fetchNotifications();
  }, []);

  // ==================================================
  // NOTIFICATIONS EN TEMPS RÉEL
  // ==================================================

  useEffect(() => {
    const handleNewNotification = (notification) => {
      console.log(
        "🔔 Nouvelle notification reçue :",
        notification
      );

      if (!notification?._id) return;

      setNotifications((prev) => {
        // Éviter les doublons
        const existe = prev.some(
          (n) => n._id === notification._id
        );

        if (existe) {
          return prev;
        }

        // Nouvelle notification en haut
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
  // MARQUER UNE NOTIFICATION COMME LUE
  // ==================================================

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/notifications/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                lu: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Erreur marquage notification :",
        error
      );
    }
  };

  // ==================================================
  // ICONES
  // ==================================================

  const getIcon = (type) => {
    switch (type) {
      case "commande":
        return <GiCardboardBox />;

      case "message":
        return <FaMessage />;

      case "favori":
        return <FaHeart />;

      case "avis":
        return "⭐";

      case "livraison":
        return <FaCar />;

      default:
        return <IoIosNotifications />;
    }
  };

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatTime = (date) => {
    if (!date) return "";

    const seconds = Math.floor(
      (Date.now() - new Date(date)) / 1000
    );

    if (seconds < 60) {
      return "À l'instant";
    }

    if (seconds < 3600) {
      return `Il y a ${Math.floor(
        seconds / 60
      )} min`;
    }

    if (seconds < 86400) {
      return `Il y a ${Math.floor(
        seconds / 3600
      )} h`;
    }

    if (seconds < 604800) {
      return `Il y a ${Math.floor(
        seconds / 86400
      )} j`;
    }

    return new Date(date).toLocaleDateString(
      "fr-FR"
    );
  };

  // ==================================================
  // NOTIFICATIONS NON LUES
  // ==================================================

  const unreadCount = notifications.filter(
    (notification) => !notification.lu
  ).length;

  // ==================================================
  // TOUT MARQUER COMME LU
  // ==================================================

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        "/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          lu: true,
        }))
      );
    } catch (error) {
      console.error(
        "Erreur marquage notifications :",
        error
      );
    }
  };

  // ==================================================
  // SUPPRIMER UNE NOTIFICATION
  // ==================================================

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(
        `/notifications/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification._id !== id
        )
      );
    } catch (error) {
      console.error(
        "Erreur suppression notification :",
        error
      );
    }
  };

  // ==================================================
  // SUPPRIMER TOUTES LES NOTIFICATIONS
  // ==================================================

  const clearAllNotifications = async () => {
    if (
      !window.confirm(
        "Supprimer toutes les notifications ?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(
        "/notifications/clear/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications([]);
    } catch (error) {
      console.error(
        "Erreur suppression notifications :",
        error
      );
    }
  };

  // ==================================================
  // AFFICHAGE
  // ==================================================

  return (
    <div className="notifications-container">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="notifications-header">

        <div>
          <h1>
            Notifications
            {unreadCount > 0 && (
              <span className="notifications-count">
                {unreadCount}
              </span>
            )}
          </h1>

          {unreadCount > 0 && (
            <p>
              {unreadCount} notification
              {unreadCount > 1 ? "s" : ""} non lue
              {unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

      </div>

      {/* ==========================================
          ACTIONS
      ========================================== */}

      {notifications.length > 0 && (
        <div className="notifications-actions">

          {unreadCount > 0 && (
            <button
              className="read-all-btn"
              onClick={markAllAsRead}
            >
              <FaCheck />
              Tout marquer comme lu
            </button>
          )}

          <button
            className="clear-all-btn"
            onClick={clearAllNotifications}
          >
            <MdDeleteForever />
            Vider toutes les notifications
          </button>

        </div>
      )}

      {/* ==========================================
          AUCUNE NOTIFICATION
      ========================================== */}

      {notifications.length === 0 ? (

        <div className="empty-notifications">

          <IoIosNotifications />

          <h2>
            Aucune notification
          </h2>

          <p>
            Vous serez informé ici de vos
            nouvelles commandes et messages.
          </p>

        </div>

      ) : (

        /* ==========================================
           LISTE
        ========================================== */

        <div className="notifications-list">

          {notifications.map(
            (notification) => (

              <div
                key={notification._id}
                className={`notification-card ${
                  notification.lu
                    ? "read"
                    : "unread"
                }`}
                onClick={() => {
                  if (!notification.lu) {
                    markAsRead(
                      notification._id
                    );
                  }
                }}
              >

                {/* ICONE */}

                <div className="notification-icon">
                  {getIcon(
                    notification.type
                  )}
                </div>

                {/* CONTENU */}

                <div className="notification-content">

                  <h2>
                    {notification.titre}
                  </h2>

                  <p>
                    {notification.message}
                  </p>

                  <small>
                    {formatTime(
                      notification.createdAt
                    )}
                  </small>

                </div>

                {/* SUPPRIMER */}

                <button
                  className="delete-notif-btn"
                  onClick={(e) => {
                    e.stopPropagation();

                    deleteNotification(
                      notification._id
                    );
                  }}
                  aria-label="Supprimer la notification"
                >
                  <MdDeleteForever />
                </button>

              </div>

            )
          )}

        </div>
      )}

    </div>
  );
}

export default Notifications;