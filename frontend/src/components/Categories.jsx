import { Link } from "react-router-dom";
import "../css/categories.css";
import { FaTractor } from "react-icons/fa";
import { GiCow,GiTomato,GiBananaBunch,GiPlantSeed } from "react-icons/gi";
import { FaBowlRice } from "react-icons/fa6";

function Categories() {

  const categories = [
    { nom: "Céréales", icon: <FaBowlRice /> },
    { nom: "Fruits", icon: <GiBananaBunch /> },
    { nom: "Légumes", icon: <GiTomato /> },
    { nom: "Élevage", icon: <GiCow /> },
    { nom: "Semences", icon: <GiPlantSeed /> },
    { nom: "Matériel", icon: <FaTractor /> },
  ];

  return (
    <section className="categories">

      <h2>Catégories populaires</h2>

      <div className="categories-grid">

        {categories.map((cat) => (

          <Link
            key={cat.nom}
            className="category-card"
            to={`/products?categorie=${cat.nom}`}
          >

            <div className="category-icon">
              {cat.icon}
            </div>

            <h3>{cat.nom}</h3>

          </Link>

        ))}

      </div>

    </section>
  );
}

export default Categories;