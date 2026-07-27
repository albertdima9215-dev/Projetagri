import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/editProfile.css";

function EditProfile() {

  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    localisation: "",
    bio: "",
  });

  const [photo, setPhoto] = useState(null);

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
        localisation: res.data.localisation || "",
        bio: res.data.bio || "",
      });

    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const token = localStorage.getItem("token");

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (photo) {
        data.append("photo", photo);
      }

      const res = await api.put("/users/profile", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(res.data.message);

    } catch (error) {
      alert(error.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="edit-profile">

      <h1>Modifier mon profil</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={formData.nom}
          onChange={handleChange}
        />

        <input
          type="text"
          name="telephone"
          placeholder="Téléphone"
          value={formData.telephone}
          onChange={handleChange}
        />

        <input
          type="text"
          name="localisation"
          placeholder="Localisation"
          value={formData.localisation}
          onChange={handleChange}
        />

        <textarea
          name="bio"
          placeholder="Parlez de votre activité..."
          value={formData.bio}
          onChange={handleChange}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
        />

        <button type="submit">
          Enregistrer
        </button>

      </form>

    </div>
  );
}

export default EditProfile;