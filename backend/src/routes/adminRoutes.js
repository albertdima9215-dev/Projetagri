const express = require("express");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getDashboard, 
  getUsers,
  updateUserRole,
  deleteUser,
  getProducts,
  deleteProduct,
  getOrders,
  updateOrderStatus,
} = require("../controllers/adminController");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  admin,
  getDashboard
);

router.get(
  "/users",
  protect,
  admin,
  getUsers
);

router.put(
  "/users/:id/role",
  protect,
  admin,
  updateUserRole
);

router.delete(
  "/users/:id",
  protect,
  admin,
  deleteUser
);

router.get(
  "/products",
  protect,
  admin,
  getProducts
);

router.delete(
  "/products/:id",
  protect,
  admin,
  deleteProduct
);

router.get(
  "/orders",
  protect,
  admin,
  getOrders
);

router.put(
  "/orders/:id/status",
  protect,
  admin,
  updateOrderStatus
);

module.exports = router;