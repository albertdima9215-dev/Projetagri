import "../css/stats.css";
import { FcBusinessman,FcStatistics } from "react-icons/fc";
import { FaHandsHelping,FaSeedling } from "react-icons/fa";

function Stats() {
  return (
    <section className="stats-section">

      <h2>AgriConnect en chiffres</h2>

      <div className="stats-container">

        <div className="stat-box">
          <h3><FcBusinessman /></h3>
          <span>850+</span>
          <p>Producteurs</p>
        </div>

        <div className="stat-box">
          <h3><FaSeedling /></h3>
          <span>2500+</span>
          <p>Produits publiés</p>
        </div>

        <div className="stat-box">
          <h3><FcStatistics /></h3>
          <span>45</span>
          <p>Villes couvertes</p>
        </div>

        <div className="stat-box">
          <h3><FaHandsHelping /></h3>
          <span>5000+</span>
          <p>Transactions</p>
        </div>

      </div>

    </section>
  );
}

export default Stats;