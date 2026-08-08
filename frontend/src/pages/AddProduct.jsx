import { useState } from "react";
import api from "../services/api";
import "../css/addProduct.css";

function AddProduct() {
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    categorie: "",
    prix: "",
    quantite: "",
    localisation: "",
  });

  const [images, setImages] = useState([]);
  
  const handleImageChange = (e) => {
    setImage([...e.target.files]);
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
      const data = new FormData();
Object.keys(formData).forEach((key) => {
  data.append(key, formData[key]);
      });

      if (image) {
        images.forEach((img) => {
          data.append("images", img);
        });
      };
      
      const token = localStorage.getItem("token");

      const res = await api.post("/products", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data.message);

      setFormData({
        nom: "",
        description: "",
        categorie: "",
        prix: "",
        quantite: "",
        localisation: "",
      });

    } catch (error) {
      alert(error.response?.data?.message || "Une erreur est survenue");
    }
  };

  return (
    <div className="add-product">
      <h1>Publier un produit</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="nom"
          placeholder="Nom du produit"
          value={formData.nom}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="categorie"
          placeholder="Catégorie"
          value={formData.categorie}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="prix"
          placeholder="Prix"
          value={formData.prix}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="quantite"
          placeholder="Quantité"
          value={formData.quantite}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="localisation"
          placeholder="Localisation"
          value={formData.localisation}
          onChange={handleChange}
          required
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />

        <button type="submit">Publier</button>

      </form>
    </div>
  );
}

export default AddProduct;