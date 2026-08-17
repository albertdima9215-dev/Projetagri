import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
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

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Connexion réussie !");

      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur de connexion");
    }
  };

  return (
    <div className="login">
      <form className="login-form" onSubmit={handleSubmit}>
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

        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}

export default Login;