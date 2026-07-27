import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/adminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  const changeRole = async (id, role) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/admin/users/${id}/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsers();

    } catch (error) {
      alert(error.response?.data?.message || "Erreur");
    }
  };

  const deleteUser = async (id) => {

  const confirmDelete = window.confirm(
    "Cette action est irréversible.\n\nVoulez-vous vraiment supprimer cet utilisateur ?"
  );

  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token");

    await api.delete(`/admin/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchUsers();

  } catch (error) {
    alert(error.response?.data?.message || "Erreur");
  }
};

  return (
    <div className="admin-users">

      <h1>Gestion des utilisateurs</h1>

      <table>

        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {users.map((user) => (

            <tr key={user._id}>

              <td>{user.nom}</td>

              <td>{user.email}</td>

              <td>{user.role}</td>

              <td>

                <button
                  onClick={() =>
                    changeRole(
                      user._id,
                      user.role === "admin"
                        ? "user"
                        : "admin"
                    )
                  }
                >
                  {user.role === "admin"
                    ? "Retirer Admin"
                    : "Rendre Admin"}
                </button>

                <button
                  onClick={() =>
                    deleteUser(user._id)
                  }
                >
                  Supprimer
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default AdminUsers;