import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    motDePasse: "",
    role: "user",
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
      const res = await api.post("/auth/register", formData);

      alert(res.data.message);

      navigate("/login");

    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="register">
      <form className="register-form" onSubmit={handleSubmit}>

        <h2>Créer un compte</h2>

        <input
          type="text"
          name="nom"
          placeholder="Nom complet"
          value={formData.nom}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Adresse email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="telephone"
          placeholder="Téléphone (ex: 77123456)"
          value={formData.telephone}
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

        <button type="submit">
          S'inscrire
        </button>

      </form>
    </div>
  );
}

export default Register;