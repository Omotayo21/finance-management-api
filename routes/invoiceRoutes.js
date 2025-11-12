const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const { authenticateUser } = require("../middleware/auth");

router.use(authenticateUser);

router.post("/", invoiceController.create);
router.get("/", invoiceController.list);
router.get("/summary", invoiceController.summary);
router.patch("/:id/pay", invoiceController.markPaid);

module.exports = router;
