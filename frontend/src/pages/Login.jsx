import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";
import "../css/login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifiant: "",
    motDePasse: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", formData);

      // Sauvegarder le token
      localStorage.setItem("token", res.data.token);

      // Sauvegarder l'utilisateur
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      // Enregistrer immédiatement l'utilisateur
      // dans sa room Socket.IO
      if (res.data.user?._id) {
        socket.emit("register", res.data.user._id);

        console.log(
          "Utilisateur enregistré sur Socket.IO :",
          res.data.user._id
        );
      }

      alert("Connexion réussie !");

      navigate("/");
    } catch (error) {
      console.error("Erreur connexion :", error);

      alert(
        error.response?.data?.message ||
        "Erreur de connexion"
      );
    }
  };

  return (
    <div className="login">
      <form
        className="login-form"
        onSubmit={handleSubmit}
      >
        <h2>Connexion</h2>

        <input
          type="text"
          name="identifiant"
          placeholder="Email ou numéro de téléphone"
          value={formData.identifiant}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="motDePasse"
          placeholder="Mot de passe"
          value={formData.motDePasse}
          onChange={handleChange}
          required
        />

        <div className="forgot-password">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
          >
            Mot de passe oublié ?
          </button>
        </div>

        <button type="submit">
          Se connecter
        </button>
      </form>
    </div>
  );
}

export default Login;