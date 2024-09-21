const express = require("express");
const {
  uploadImages,
  getAllImages,
  getImageById,
  updateImage,
  deleteImage,
} = require("../controllers/imageController");

const router = express.Router();

router.post("/upload", uploadImages);
router.get("/images", getAllImages);
router.get("/image/:id", getImageById);
router.put("/image/:id", updateImage);
router.delete("/image/:id", deleteImage);

module.exports = router;
