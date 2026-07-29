import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/adminPayments.css";

function AdminPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/admin/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPayments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (id, statutPaiement) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/admin/payments/${id}`,
        { statutPaiement },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchPayments();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Payé":
        return "paid";
      case "Échoué":
        return "failed";
      default:
        return "pending";
    }
  };

  return (
    <div className="admin-payments">
      <h1>Gestion des paiements</h1>

      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Acheteur</th>
            <th>Vendeur</th>
            <th>Montant</th>
            <th>Méthode</th>
            <th>Statut</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((payment) => (
            <tr key={payment._id}>
              <td>{payment.produit?.nom}</td>
              <td>{payment.acheteur?.nom}</td>
              <td>{payment.vendeur?.nom}</td>
              <td>{payment.montant} FCFA</td>
              <td>{payment.methodePaiement}</td>

              <td>
                <div className="status-container">
                  <span
                    className={`status ${getStatusClass(
                      payment.statutPaiement
                    )}`}
                  >
                    {payment.statutPaiement}
                  </span>

                  <select
  value={payment.statutPaiement}
  disabled={payment.statutPaiement === "Payé"}
  onChange={(e) =>
    updateStatus(payment._id, e.target.value)
  }
>
                    <option>En attente</option>
                    <option>Payé</option>
                    <option>Échoué</option>
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPayments;