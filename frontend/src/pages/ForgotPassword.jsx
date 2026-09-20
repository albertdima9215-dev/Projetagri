import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/forgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [identifiant, setIdentifiant] = useState("");

  const [code, setCode] = useState("");

  const [nouveauMotDePasse, setNouveauMotDePasse] =
    useState("");

  const [
    confirmationMotDePasse,
    setConfirmationMotDePasse,
  ] = useState("");

  const [resetToken, setResetToken] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==================================================
  // ÉTAPE 1
  // ==================================================

  const demanderCode = async (e) => {
    e.preventDefault();

    if (!identifiant.trim()) {
      setError(
        "Veuillez saisir votre email ou votre numéro de téléphone."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await api.post(
        "/auth/forgot-password",
        {
          identifiant: identifiant.trim(),
        }
      );

      setSuccess(res.data.message);

      setStep(2);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Impossible d'envoyer le code."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // ÉTAPE 2
  // ==================================================

  const verifierCode = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError(
        "Veuillez saisir le code à 6 chiffres."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await api.post(
        "/auth/verify-reset-code",
        {
          identifiant: identifiant.trim(),
          code: code.trim(),
        }
      );

      setResetToken(
        res.data.resetToken
      );

      setSuccess(
        "Code vérifié avec succès."
      );

      setStep(3);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Code incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // ÉTAPE 3
  // ==================================================

  const changerMotDePasse = async (e) => {
    e.preventDefault();

    if (nouveauMotDePasse.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (
      nouveauMotDePasse !==
      confirmationMotDePasse
    ) {
      setError(
        "Les deux mots de passe ne correspondent pas."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await api.post(
        "/auth/reset-password",
        {
          resetToken,
          nouveauMotDePasse,
        }
      );

      setSuccess(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1800);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Impossible de modifier le mot de passe."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">

      <div className="forgot-password-card">

        <div className="forgot-password-logo">
          FP
        </div>

        <h1>
          Mot de passe oublié ?
        </h1>

        <p className="forgot-password-description">
          {step === 1 &&
            "Saisissez votre email ou votre numéro de téléphone pour récupérer votre compte."}

          {step === 2 &&
            "Saisissez le code à 6 chiffres envoyé à votre adresse email."}

          {step === 3 &&
            "Choisissez votre nouveau mot de passe."}
        </p>

        {/* ÉTAPES */}

        <div className="reset-steps">

          <span className={step >= 1 ? "active" : ""}>
            1
          </span>

          <div></div>

          <span className={step >= 2 ? "active" : ""}>
            2
          </span>

          <div></div>

          <span className={step >= 3 ? "active" : ""}>
            3
          </span>

        </div>

        {/* ERREUR */}

        {error && (
          <div className="reset-error">
            {error}
          </div>
        )}

        {/* SUCCÈS */}

        {success && (
          <div className="reset-success">
            {success}
          </div>
        )}

        {/* ==========================================
            ÉTAPE 1
        ========================================== */}

        {step === 1 && (

          <form onSubmit={demanderCode}>

            <label>
              Email ou téléphone
            </label>

            <input
              type="text"
              placeholder="Email ou numéro de téléphone"
              value={identifiant}
              onChange={(e) =>
                setIdentifiant(e.target.value)
              }
              autoComplete="username"
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Envoi..."
                : "Recevoir le code"}
            </button>

          </form>

        )}

        {/* ==========================================
            ÉTAPE 2
        ========================================== */}

        {step === 2 && (

          <form onSubmit={verifierCode}>

            <label>
              Code de vérification
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              className="code-input"
              autoComplete="one-time-code"
            />

            <button
              type="submit"
              disabled={
                loading || code.length !== 6
              }
            >
              {loading
                ? "Vérification..."
                : "Vérifier le code"}
            </button>

            <button
              type="button"
              className="secondary-reset-btn"
              onClick={() => {
                setStep(1);
                setCode("");
                setError("");
                setSuccess("");
              }}
            >
              Modifier l'identifiant
            </button>

          </form>

        )}

        {/* ==========================================
            ÉTAPE 3
        ========================================== */}

        {step === 3 && (

          <form onSubmit={changerMotDePasse}>

            <label>
              Nouveau mot de passe
            </label>

            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={nouveauMotDePasse}
              onChange={(e) =>
                setNouveauMotDePasse(
                  e.target.value
                )
              }
              autoComplete="new-password"
            />

            <label>
              Confirmer le mot de passe
            </label>

            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmationMotDePasse}
              onChange={(e) =>
                setConfirmationMotDePasse(
                  e.target.value
                )
              }
              autoComplete="new-password"
            />

            <small className="password-help">
              Minimum 8 caractères.
            </small>

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Modification..."
                : "Modifier le mot de passe"}
            </button>

          </form>

        )}

        <button
          type="button"
          className="back-login"
          onClick={() => navigate("/login")}
        >
          ← Retour à la connexion
        </button>

      </div>

    </div>
  );
}

export default ForgotPassword;