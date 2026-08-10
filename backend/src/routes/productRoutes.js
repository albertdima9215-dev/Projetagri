const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const {createProduct,getProducts,getProductById,updateProduct,deleteProduct, getMyProducts,getProductsForMap,} = require("../controllers/productController.js");
const upload = require("../middleware/uploadMiddleware");



const router = express.Router();

router.post("/", protect, upload.array("images", 5), createProduct);

router.get("/", getProducts);

router.get("/mes-produits", protect, getMyProducts);

router.get("/map", getProductsForMap);

router.get("/:id", getProductById);

router.put("/:id", protect, upload.array("images", 5), updateProduct);

router.delete("/:id", protect, deleteProduct);

module.exports = router;