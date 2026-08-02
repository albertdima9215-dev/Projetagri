import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/register.css";

//Icons
import { FaEye, FaEyeSlash } from "react-icons/fa";


function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
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
    if (/[^A-Za-z0-9]/.test(password))   strength++;

    setPasswordStrength(strength);
  };

  const handleChange = (e) => {
    setFormData({
    ...formData,
    [e.target.name]: e.target.value,
    });

    if (e.target.name === "motDePasse") {
      checkPasswordStrength(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData.motDePasse !==                     formData.confirmerMotDePasse) {
        alert("Les mots de passe ne correspondent pas.");
        return;
      }

      if (passwordStrength < 3) {
        alert("Le mot de passe est trop faible.");
        return;
      }
      
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
    onClick={() =>                         setShowPassword(!showPassword)}
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
          {passwordStrength >= 4 && "🟢 Fort"}
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
    onClick={() =>   setShowConfirmPassword(!showConfirmPassword)
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