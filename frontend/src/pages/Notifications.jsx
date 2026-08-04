import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/notifications.css";

//Icons
import { GiCardboardBox} from "react-icons/gi";
import { FaHeart, FaCar } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { IoIosNotifications } from "react-icons/io";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

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
  prev.map((n) =>
    n._id === id ? { ...n, lu: true } : n
  )
);

  } catch (error) {
    console.log(error);
  }
};

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

  const formatTime = (date) => {

  const seconds =
    Math.floor((Date.now() - new Date(date)) / 1000);

  if (seconds < 60)
    return "À l'instant";

  if (seconds < 3600)
    return `Il y a ${Math.floor(seconds / 60)} min`;

  if (seconds < 86400)
    return `Il y a ${Math.floor(seconds / 3600)} h`;

  if (seconds < 604800)
    return `Il y a ${Math.floor(seconds / 86400)} j`;

  return new Date(date).toLocaleDateString("fr-FR");
};

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
  prev.map((n) => ({ ...n, lu: true }))
    );

  } catch (error) {
    console.log(error);
  }

};

  return (
    <div className="notifications-container">
      <h1>Notifications</h1>

      <button
  className="read-all-btn"
  onClick={markAllAsRead}
>
        ✔ Tout marquer comme lu
      </button>

      {notifications.length === 0 ? (
        <p>Aucune notification.</p>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification._id}
            className={`notification-card ${
            notification.lu ? "read" : "unread"
            }`}
            onClick={() => !notification.lu && markAsRead(notification._id)}
>
            <h1>
              {getIcon(notification.type)}                  {notification.titre}
            </h1>

            <p>{notification.message}</p>

          <small>
          {formatTime(notification.createdAt)}
          </small>
        </div>
        ))
      )}
    </div>
  );
}

export default Notifications;