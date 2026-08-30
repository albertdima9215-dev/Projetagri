import { FaWhatsapp } from "react-icons/fa";
import "../css/floatingWhatsApp.css";

function FloatingWhatsApp() {
  const phone = "221711492700"; // remplace par ton numéro
  const message =
  "Bonjour, j'aimerais obtenir des informations sur les produits AgriConnect.";

  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}` }
      className="floating-whatsapp"
      target="_blank"
      rel="noreferrer"
      aria-label="Contacter sur WhatsApp"
    >
      <FaWhatsapp />
    </a>
  );
}

export default FloatingWhatsApp;