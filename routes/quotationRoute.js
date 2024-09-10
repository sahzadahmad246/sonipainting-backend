const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotationController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
// Define routes
router.post("/quotations", quotationController.createQuotation);
router.get("/quotations/:id", quotationController.getQuotationById);
router.get("/quotations", quotationController.getAllQuotations);
router.put(
  "/quotations/:id",
  upload.single("signature"),
  quotationController.updateQuotation
);
router.delete("/quotations/:id", quotationController.deleteQuotation);

module.exports = router;
