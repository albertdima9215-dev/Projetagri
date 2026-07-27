import "../css/testimonials.css";

function Testimonials() {

  const testimonials = [
    {
      nom: "Issa Ouédraogo",
      ville: "Bobo-Dioulasso",
      texte:
        "Grâce à AgriConnect Faso, j'ai vendu toute ma récolte de maïs en moins d'une semaine.",
      note: "⭐⭐⭐⭐⭐",
    },

    {
      nom: "Aminata Traoré",
      ville: "Ouagadougou",
      texte:
        "J'ai trouvé rapidement des légumes frais directement auprès d'un producteur.",
      note: "⭐⭐⭐⭐⭐",
    },

    {
      nom: "Moussa Sawadogo",
      ville: "Koudougou",
      texte:
        "La plateforme est simple à utiliser et les échanges avec les vendeurs sont rapides.",
      note: "⭐⭐⭐⭐⭐",
    },
  ];

  return (
    <section className="testimonials">

      <h2>Ce que disent nos utilisateurs</h2>

      <div className="testimonial-container">

        {testimonials.map((item, index) => (

          <div className="testimonial-card" key={index}>

            <div className="stars">
              {item.note}
            </div>

            <p className="text">
              "{item.texte}"
            </p>

            <h3>{item.nom}</h3>

            <span>{item.ville}</span>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Testimonials;