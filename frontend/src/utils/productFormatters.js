// FORMATAGE DES PRODUITS AGRICONNECT

export const formatUnite = (unite) => {
  const unites = {
    "1kg": "1 kg",
    "5kg": "5 kg",
    "10kg": "10 kg",
    "25kg": "25 kg",
    "50kg": "50 kg",
    "100kg": "100 kg",
    "1tonne": "1 tonne",

    piece: "pièce",
    sac: "sac",
    caisse: "caisse",
    carton: "carton",
    bidon: "bidon",
    litre: "litre",

    lot: "lot",
  };

  return unites[unite] || unite;
};

// --------------------------------------------------
// Prix du produit
// --------------------------------------------------

export const getPrixLabel = (product) => {
  if (!product) return "";

  const prix = Number(
    product.prix || 0
  ).toLocaleString("fr-FR");

  const unite = formatUnite(
    product.unite || "piece"
  );

  // Vente par lot
  if (product.typeVente === "lot") {
    const quantiteLot = Number(
      product.quantiteParLot || 0
    );

    if (quantiteLot > 0) {
      let uniteLot = unite;

      if (product.unite === "piece") {
        uniteLot =
          quantiteLot > 1
            ? "pièces"
            : "pièce";
      }

      return `${prix} FCFA / lot de ${quantiteLot} ${uniteLot}`;
    }

    return `${prix} FCFA / lot`;
  }

  // Vente au poids
  if (product.typeVente === "poids") {
    return `${prix} FCFA / ${unite}`;
  }

  // Vente à l'unité
  return `${prix} FCFA / ${unite}`;
};

// --------------------------------------------------
// Type de vente
// --------------------------------------------------

export const getSaleTypeLabel = (product) => {
  if (!product) return null;

  switch (product.typeVente) {
    case "poids":
      return "Au poids";

    case "lot":
      return "Par lot";

    case "unite":
      if (product.unite === "piece") {
        return "À l'unité";
      }

      return `Par ${formatUnite(product.unite)}`;

    default:
      return null;
  }
};

// --------------------------------------------------
// Stock disponible
// --------------------------------------------------

export const getStockLabel = (product) => {
  if (!product) return "";

  const quantite = Number(
    product.quantite || 0
  );

  if (quantite === 0) {
    return "Rupture de stock";
  }

  // Vente par lot
  if (product.typeVente === "lot") {
    return `${quantite.toLocaleString(
      "fr-FR"
    )} lot${
      quantite > 1 ? "s" : ""
    } disponible${
      quantite > 1 ? "s" : ""
    }`;
  }

  // Vente au poids
  if (product.typeVente === "poids") {
    const poidsValeur = {
      "1kg": 1,
      "5kg": 5,
      "10kg": 10,
      "25kg": 25,
      "50kg": 50,
      "100kg": 100,
      "1tonne": 1000,
    };

    const kg = poidsValeur[
      product.unite
    ];

    if (kg) {
      const totalKg = quantite * kg;

      return `${totalKg.toLocaleString(
        "fr-FR"
      )} kg disponibles`;
    }

    return `${quantite} ${formatUnite(
      product.unite
    )} disponibles`;
  }

  // Vente à l'unité
  const unite = formatUnite(
    product.unite || "piece"
  );

  return `${quantite.toLocaleString(
    "fr-FR"
  )} ${unite}${
    quantite > 1 ? "s" : ""
  } disponibles`;
};

// --------------------------------------------------
// Quantité affichée sur la page détails
// --------------------------------------------------

export const getQuantiteLabel = (product) => {
  if (!product) return "";

  const quantite = Number(
    product.quantite || 0
  );

  if (product.typeVente === "lot") {
    return `${quantite.toLocaleString(
      "fr-FR"
    )} lot${
      quantite > 1 ? "s" : ""
    }`;
  }

  if (product.typeVente === "poids") {
    const poidsValeur = {
      "1kg": 1,
      "5kg": 5,
      "10kg": 10,
      "25kg": 25,
      "50kg": 50,
      "100kg": 100,
      "1tonne": 1000,
    };

    const kg = poidsValeur[
      product.unite
    ];

    if (kg) {
      const totalKg = quantite * kg;

      return `${totalKg.toLocaleString(
        "fr-FR"
      )} kg`;
    }
  }

  const unite = formatUnite(
    product.unite || "piece"
  );

  return `${quantite.toLocaleString(
    "fr-FR"
  )} ${unite}${
    quantite > 1 ? "s" : ""
  }`;
};

// --------------------------------------------------
// Libellé pour la commande
// --------------------------------------------------

export const getOrderLabel = (product) => {
  if (!product) return "Quantité";

  if (product.typeVente === "lot") {
    return "Nombre de lots";
  }

  if (product.typeVente === "poids") {
    return `Nombre de ${formatUnite(
      product.unite || "1kg"
    )}`;
  }

  return `Nombre de ${formatUnite(
    product.unite || "piece"
  )}`;
};

// --------------------------------------------------
// Quantité sélectionnée lors de la commande
// --------------------------------------------------

export const getSelectedQuantityLabel = (
  product,
  quantite
) => {
  if (!product) return "";

  const qte = Number(
    quantite || 0
  );

  if (product.typeVente === "lot") {
    return `${qte} lot${
      qte > 1 ? "s" : ""
    }`;
  }

  const unite = formatUnite(
    product.unite || "piece"
  );

  return `${qte} ${unite}${
    qte > 1 ? "s" : ""
  }`;
};