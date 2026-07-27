const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const {createProduct,getProducts,getProductById,updateProduct,deleteProduct, getMyProducts,} = require("../controllers/productController.js");
const upload = require("../middleware/uploadMiddleware");



const router = express.Router();

router.post("/", protect,upload.single("image"), createProduct);

router.get("/", getProducts);

router.get("/mes-produits", protect, getMyProducts);

router.get("/:id", getProductById);

router.put("/:id", protect,upload.single("image"), updateProduct);

router.delete("/:id", protect, deleteProduct);

module.exports = router;