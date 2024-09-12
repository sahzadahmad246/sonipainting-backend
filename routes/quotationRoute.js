const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotationController");

// Define routes
router.post("/quotations", quotationController.createQuotation);
router.get("/quotations/:id", quotationController.getQuotationById);
router.get("/quotations", quotationController.getAllQuotations);
router.put("/update/sign/:id", quotationController.updateSignature);
router.put("/update/quotation/:id", quotationController.updateQuotation);
router.delete("/quotations/:id", quotationController.deleteQuotation);

module.exports = router;
