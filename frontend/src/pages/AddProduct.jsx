import { useState } from "react";
import api from "../services/api";
import "../css/addProduct.css";
import imageCompression from "browser-image-compression";

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
  
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    const options = {
      maxSizeMB: 0.4,          // 400 Ko max
      maxWidthOrHeight: 1280,  // redimensionne si trop grande
      useWebWorker: true,
    };

    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          const compressed = await imageCompression(file, options);

          console.log(
            file.name,
            (file.size / 1024).toFixed(0) + "KB →",
            (compressed.size / 1024).toFixed(0) + "KB"
          );

          return compressed;
        })
      );

      setImages(compressedFiles);

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
      const data = new FormData();
Object.keys(formData).forEach((key) => {
  data.append(key, formData[key]);
      });

      if (images.length) {
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

      setImages([]);

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

        {images.length > 0 && (
          <div className="image-preview-grid">
            {images.map((img, index) => (
              <div key={index} className="preview-item">
                <img
          src={URL.createObjectURL(img)}
          alt="preview"
        />

                <span>
                {(img.size / 1024).toFixed(0)} KB
                </span>
              </div>
            ))}
          </div>
        )}

        <button type="submit">Publier</button>

      </form>
    </div>
  );
}

export default AddProduct;