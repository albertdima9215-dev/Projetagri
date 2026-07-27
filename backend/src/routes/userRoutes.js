const express = require("express");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getSellerProfile,
  updateProfile,getMyProfile
} = require("../controllers/userController");


const router = express.Router();

router.get("/me", protect, getMyProfile);

router.get("/profile/:id", getSellerProfile);

router.put(
  "/profile",
  protect,
  upload.single("photo"),
  updateProfile
);

module.exports = router;