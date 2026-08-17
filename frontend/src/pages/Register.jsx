import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/register.css";

import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();

  const paysDisponibles = [
    { nom: "Burkina Faso", indicatif: "+226" },
    { nom: "Sénégal", indicatif: "+221" },
    { nom: "Côte d'Ivoire", indicatif: "+225" },
    { nom: "Mali", indicatif: "+223" },
    { nom: "Niger", indicatif: "+227" },
    { nom: "Bénin", indicatif: "+229" },
    { nom: "Togo", indicatif: "+228" },
    { nom: "Ghana", indicatif: "+233" },
    { nom: "Guinée", indicatif: "+224" },
    { nom: "Nigeria", indicatif: "+234" },
    { nom: "Gambie", indicatif: "+220" },
    { nom: "Sierra Leone", indicatif: "+232" },
    { nom: "Liberia", indicatif: "+231" },
    { nom: "Guinée-Bissau", indicatif: "+245" },
    { nom: "Cap-Vert", indicatif: "+238" },
  ];

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    pays: "Burkina Faso",
    indicatif: "+226",
    telephone: "",
    motDePasse: "",
    confirmerMotDePasse: "",
    role: "acheteur",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    setPasswordStrength(strength);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "motDePasse") {
      checkPasswordStrength(value);
    }
  };

  const handleCountryChange = (e) => {
    const paysSelectionne = paysDisponibles.find(
      (pays) => pays.nom === e.target.value
    );

    if (!paysSelectionne) return;

    setFormData({
      ...formData,
      pays: paysSelectionne.nom,
      indicatif: paysSelectionne.indicatif,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.motDePasse !== formData.confirmerMotDePasse) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    if (passwordStrength < 5) {
      alert(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
      );
      return;
    }

    try {
      const res = await api.post("/auth/register", formData);

      alert(res.data.message);

      navigate("/login");

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Erreur lors de l'inscription"
      );
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

        {/* PAYS */}
        <select
          name="pays"
          value={formData.pays}
          onChange={handleCountryChange}
          required
        >
          {paysDisponibles.map((pays) => (
            <option key={pays.nom} value={pays.nom}>
              {pays.nom} ({pays.indicatif})
            </option>
          ))}
        </select>

        {/* TELEPHONE */}
        <div className="phone-group">

          <span className="phone-prefix">
            {formData.indicatif}
          </span>

          <input
  type="tel"
  name="telephone"
  placeholder="Numéro de téléphone"
  value={formData.telephone}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, "");

    setFormData({
      ...formData,
      telephone: value,
    });
  }}
  required
/>

        </div>

        <div className="password-group">

          <input
            type={showPassword ? "text" : "password"}
            name="motDePasse"
            placeholder="Mot de passe"
            value={formData.motDePasse}
            onChange={handleChange}
            required
          />

          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>

        </div>

        <div className="strength-bar">

          <div
            className={`strength strength-${passwordStrength}`}
          ></div>

        </div>

        <p className="strength-text">

          {passwordStrength <= 2 && "🔴 Faible"}

          {passwordStrength === 3 && "🟠 Moyen"}

          {passwordStrength === 4 && "🟢 Bon"}

          {passwordStrength === 5 && "🟢 Fort"}

        </p>

        <div className="password-group">

          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmerMotDePasse"
            placeholder="Confirmer le mot de passe"
            value={formData.confirmerMotDePasse}
            onChange={handleChange}
            required
          />

          <button
            type="button"
            className="toggle-password"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>

        </div>

        {formData.confirmerMotDePasse &&
          formData.motDePasse !== formData.confirmerMotDePasse && (
            <p className="error-text">
              ❌ Les mots de passe ne correspondent pas
            </p>
          )}

        {formData.confirmerMotDePasse &&
          formData.motDePasse === formData.confirmerMotDePasse && (
            <p className="success-text">
              ✅ Les mots de passe correspondent
            </p>
          )}

        <button className="submit-btn" type="submit">
          S'inscrire
        </button>

      </form>

    </div>
  );
}

export default Register;