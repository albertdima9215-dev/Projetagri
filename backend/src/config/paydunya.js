const paydunya = require("paydunya");

const setup = new paydunya.Setup({
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY,
  token: process.env.PAYDUNYA_TOKEN,
  mode: process.env.PAYDUNYA_MODE || "test",
});

const store = new paydunya.Store({
  name: "AgriConnect",
  tagline: "La marketplace agricole de la sous-région",
  phoneNumber: process.env.PAYDUNYA_PHONE || "",
  websiteURL: process.env.FRONTEND_URL || "",
  returnURL: `${process.env.BACKEND_URL}/api/payments/success`,
  cancelURL: `${process.env.BACKEND_URL}/api/payments/cancel`,
  callbackURL: `${process.env.BACKEND_URL}/api/payments/callback`,
});

module.exports = {
  paydunya,
  setup,
  store,
};