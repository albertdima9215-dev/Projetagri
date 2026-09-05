// ==================================================
// FORMATAGE DES PRODUITS AGRICONNECT
// ==================================================

// --------------------------------------------------
// UNITÉS
// --------------------------------------------------

export const formatUnite = (unite) => {
  const unites = {
    // Poids
    "1kg": "1 kg",
    "5kg": "5 kg",
    "10kg": "10 kg",
    "25kg": "25 kg",
    "50kg": "50 kg",
    "100kg": "100 kg",
    "1tonne": "1 tonne",
    kg: "kg",

    // Unités
    piece: "pièce",
    sac: "sac",
    caisse: "caisse",
    carton: "carton",
    bidon: "bidon",
    litre: "litre",

    // Lot
    lot: "lot",
  };

  return unites[unite] || unite || "";
};

// --------------------------------------------------
// PLURIEL DES UNITÉS
// --------------------------------------------------

export const formatUnitePluriel = (
  unite,
  quantite = 1
) => {
  const qte = Number(quantite);

  if (qte <= 1) {
    return formatUnite(unite);
  }

  const pluriels = {
    piece: "pièces",
    sac: "sacs",
    caisse: "caisses",
    carton: "cartons",
    bidon: "bidons",
    litre: "litres",
    kg: "kg",

    "1kg": "1 kg",
    "5kg": "5 kg",
    "10kg": "10 kg",
    "25kg": "25 kg",
    "50kg": "50 kg",
    "100kg": "100 kg",
    "1tonne": "1 tonne",
  };

  return (
    pluriels[unite] ||
    formatUnite(unite)
  );
};

// --------------------------------------------------
// PRIX DU PRODUIT
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
      const uniteLot =
        formatUnitePluriel(
          product.unite,
          quantiteLot
        );

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
// TYPE DE VENTE
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

      return `Par ${formatUnite(
        product.unite
      )}`;

    default:
      return null;
  }
};

// --------------------------------------------------
// STOCK DISPONIBLE
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
// QUANTITÉ AFFICHÉE SUR LA PAGE DÉTAILS
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

  const unite =
    formatUnitePluriel(
      product.unite || "piece",
      quantite
    );

  return `${quantite.toLocaleString(
    "fr-FR"
  )} ${unite}`;
};

// --------------------------------------------------
// LIBELLÉ POUR LA COMMANDE
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
// QUANTITÉ SÉLECTIONNÉE LORS DE LA COMMANDE
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

  const unite =
    formatUnitePluriel(
      product.unite || "piece",
      qte
    );

  return `${qte} ${unite}`;
};

// --------------------------------------------------
// UNITÉS DISPONIBLES DANS LE FORMULAIRE
// --------------------------------------------------

export const unitesPoids = [
  {
    value: "1kg",
    label: "1 kg",
  },
  {
    value: "5kg",
    label: "5 kg",
  },
  {
    value: "10kg",
    label: "10 kg",
  },
  {
    value: "25kg",
    label: "25 kg",
  },
  {
    value: "50kg",
    label: "50 kg",
  },
  {
    value: "100kg",
    label: "100 kg",
  },
  {
    value: "1tonne",
    label: "1 tonne",
  },
];

export const unites = [
  {
    value: "piece",
    label: "Pièce",
  },
  {
    value: "sac",
    label: "Sac",
  },
  {
    value: "caisse",
    label: "Caisse",
  },
  {
    value: "carton",
    label: "Carton",
  },
  {
    value: "bidon",
    label: "Bidon",
  },
  {
    value: "litre",
    label: "Litre",
  },
];

export const unitesLot = [
  {
    value: "kg",
    label: "kg",
  },
  {
    value: "piece",
    label: "pièce(s)",
  },
  {
    value: "sac",
    label: "sac(s)",
  },
  {
    value: "caisse",
    label: "caisse(s)",
  },
  {
    value: "carton",
    label: "carton(s)",
  },
];

// --------------------------------------------------
// UNITÉS SELON LE TYPE DE VENTE
// --------------------------------------------------

export const getUnitesForSaleType = (
  typeVente
) => {
  if (typeVente === "poids") {
    return unitesPoids;
  }

  if (typeVente === "unite") {
    return unites;
  }

  if (typeVente === "lot") {
    return unitesLot;
  }

  return [];
};

// --------------------------------------------------
// APERÇU DU PRIX
// --------------------------------------------------

export const getPricePreview = (product) => {
  if (
    !product ||
    !product.prix ||
    !product.unite
  ) {
    return "";
  }

  const prix = Number(
    product.prix
  ).toLocaleString("fr-FR");

  if (product.typeVente === "lot") {
    const quantiteLot = Number(
      product.quantiteParLot || 0
    );

    if (quantiteLot > 0) {
      return `Prix de vente : ${prix} FCFA / lot de ${quantiteLot} ${formatUnitePluriel(
        product.unite,
        quantiteLot
      )}`;
    }

    return `Prix de vente : ${prix} FCFA / lot`;
  }

  return `Prix de vente : ${prix} FCFA / ${formatUnite(
    product.unite
  )}`;
};