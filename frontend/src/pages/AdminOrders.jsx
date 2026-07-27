import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/adminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "En attente":
        return "pending";

      case "Payée":
        return "paid";

      case "Expédiée":
        return "shipped";

      case "Livrée":
        return "delivered";

      case "Annulée":
        return "cancelled";

      default:
        return "";
    }
  };

  const openModal = (order) => {
  setSelectedOrder(order);
  setNewStatus(order.statut);
  setShowModal(true);
};

  const updateStatus = async () => {
  try {
    const token = localStorage.getItem("token");

    await api.put(
      `/admin/orders/${selectedOrder._id}/status`,
      {
        statut: newStatus,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setShowModal(false);
    fetchOrders();

  } catch (error) {
    alert(error.response?.data?.message || "Erreur");
  }
};

  return (
    <div className="admin-orders">

      <h1>Gestion des commandes</h1>

      <table>

        <thead>
          <tr>
            <th>Produit</th>
            <th>Acheteur</th>
            <th>Vendeur</th>
            <th>Montant</th>
            <th>Paiement</th>
            <th>Statut</th>
          </tr>
        </thead>

        <tbody>

          {orders.map((order) => (

            <tr key={order._id}>

              <td>{order.produit?.nom}</td>

              <td>{order.acheteur?.nom}</td>

              <td>{order.vendeur?.nom}</td>

              <td>{order.montant} FCFA</td>

              <td>{order.methodePaiement}</td>

              <td>
                <div className="status-container">

                  <span
    className={`status ${getStatusClass(order.statut)}`}
  >
                    {order.statut}
                  </span>

                  <td>

                    <span
    className={`status ${getStatusClass(order.statut)}`}
  >
                      {order.statut}
                    </span>

                    <br />

                    <button
    className="edit-status-btn"
    onClick={() => openModal(order)}
  >
                      ✏ Modifier
                    </button>

                  </td>

                </div>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {showModal && (
        <div className="modal-overlay">

          <div className="status-modal">

            <h2>Modifier le statut</h2>

            <p>
        Produit :
              <strong>
                {" "}
                {selectedOrder.produit?.nom}
              </strong>
            </p>

            <select
        value={newStatus}
        onChange={(e) =>
          setNewStatus(e.target.value)
        }
      >
              <option>En attente</option>
              <option>Payée</option>
              <option>Expédiée</option>
              <option>Livrée</option>
              <option>Annulée</option>
            </select>

            <div className="modal-buttons">

            <button
          className="cancel-btn"
          onClick={() => setShowModal(false)}
        >
              Annuler
            </button>

            <button
          className="save-btn"
          onClick={updateStatus}
        >
              Enregistrer
            </button>

          </div>

        </div>

      </div>
    )}

    </div>
  );
}

export default AdminOrders;