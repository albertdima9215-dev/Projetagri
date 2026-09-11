import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/editProfile.css";

import { FaMapPin } from "react-icons/fa";

function EditProfile() {
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    pays: "",
    indicatif: "",
    localisation: "",
    bio: "",
  });

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==================================================
  // RÉCUPÉRER LE PROFIL
  // ==================================================

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFormData({
        nom: res.data.nom || "",
        telephone: res.data.telephone || "",
        pays: res.data.pays || "",
        indicatif: res.data.indicatif || "",
        localisation: res.data.localisation || "",
        bio: res.data.bio || "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  // ==================================================
  // CHANGEMENT DES CHAMPS
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==================================================
  // CHANGEMENT DU PAYS
  // ==================================================

  const handleCountryChange = (e) => {
    const value = e.target.value;

    const countries = {
      BurkinaFaso: "+226",
      Sénégal: "+221",
      CôtedIvoire: "+225",
      Mali: "+223",
      Niger: "+227",
      Bénin: "+229",
      Togo: "+228",
      Guinée: "+224",
      Mauritanie: "+222",
      Ghana: "+233",
    };

    setFormData((prev) => ({
      ...prev,
      pays: value,
      indicatif: countries[value] || "",
    }));
  };

  // ==================================================
  // ENREGISTRER
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      alert("Veuillez renseigner votre nom.");
      return;
    }

    if (!formData.telephone.trim()) {
      alert("Veuillez renseigner votre numéro de téléphone.");
      return;
    }

    if (!formData.pays) {
      alert("Veuillez sélectionner votre pays.");
      return;
    }

    if (!formData.indicatif) {
      alert("L'indicatif du pays est obligatoire.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const data = new FormData();

      data.append("nom", formData.nom);
      data.append("telephone", formData.telephone);
      data.append("pays", formData.pays);
      data.append("indicatif", formData.indicatif);
      data.append("localisation", formData.localisation);
      data.append("bio", formData.bio);

      if (photo) {
        data.append("photo", photo);
      }

      const res = await api.put(
        "/users/profile",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(res.data.message);

      // Recharger les données après modification
      await fetchProfile();

      setPhoto(null);
    } catch (error) {
      console.error(
        "Erreur modification profil :",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Erreur lors de la modification du profil."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // PARTAGER LA POSITION
  // ==================================================

  const shareLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const token = localStorage.getItem("token");

          const res = await api.put(
            "/users/location",
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log(res.data);

          alert("Position enregistrée avec succès.");
        } catch (error) {
          console.error(error);

          alert(
            error.response?.data?.message ||
              "Erreur lors de l'enregistrement de la position."
          );
        }
      },
      (err) => {
        console.error(err);

        alert(
          "Impossible d'obtenir votre position. Vérifiez que la localisation est autorisée."
        );
      }
    );
  };

  // ==================================================
  // AFFICHAGE
  // ==================================================

  return (
    <div className="edit-profile">
      <h1>Modifier mon profil</h1>

      <form onSubmit={handleSubmit}>
        {/* NOM */}

        <label>Nom</label>

        <input
          type="text"
          name="nom"
          placeholder="Votre nom"
          value={formData.nom}
          onChange={handleChange}
          required
        />

        {/* TÉLÉPHONE */}

        <label>Numéro de téléphone</label>

        <input
          type="tel"
          name="telephone"
          placeholder="Ex : 771234567"
          value={formData.telephone}
          onChange={handleChange}
          required
        />

        {/* PAYS */}

        <label>Pays</label>

        <select
          name="pays"
          value={formData.pays}
          onChange={handleCountryChange}
          required
        >
          <option value="">
            Sélectionner votre pays
          </option>

          <option value="BurkinaFaso">
            🇧🇫 Burkina Faso
          </option>

          <option value="Sénégal">
            🇸🇳 Sénégal
          </option>

          <option value="CôtedIvoire">
            🇨🇮 Côte d'Ivoire
          </option>

          <option value="Mali">
            🇲🇱 Mali
          </option>

          <option value="Niger">
            🇳🇪 Niger
          </option>

          <option value="Bénin">
            🇧🇯 Bénin
          </option>

          <option value="Togo">
            🇹🇬 Togo
          </option>

          <option value="Guinée">
            🇬🇳 Guinée
          </option>

          <option value="Mauritanie">
            🇲🇷 Mauritanie
          </option>

          <option value="Ghana">
            🇬🇭 Ghana
          </option>
        </select>

        {/* INDICATIF */}

        <label>Indicatif</label>

        <input
          type="text"
          name="indicatif"
          value={formData.indicatif}
          readOnly
          placeholder="+226"
        />

        {/* LOCALISATION */}

        <label>Localisation</label>

        <input
          type="text"
          name="localisation"
          placeholder="Ex : Ouagadougou"
          value={formData.localisation}
          onChange={handleChange}
        />

        {/* BIO */}

        <label>Présentation</label>

        <textarea
          name="bio"
          placeholder="Parlez de votre activité..."
          value={formData.bio}
          onChange={handleChange}
        />

        {/* PHOTO */}

        <label>Photo de profil</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setPhoto(e.target.files?.[0] || null)
          }
        />

        {/* POSITION */}

        <button
          type="button"
          onClick={shareLocation}
          className="location-btn"
        >
          <FaMapPin />
          Partager ma position
        </button>

        {/* ENREGISTRER */}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Enregistrement..."
            : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}

export default EditProfile;