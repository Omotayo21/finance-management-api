const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const { authenticateUser } = require("../middleware/auth");
const { generateInvoicePDF } = require("../services/pdfService");
const { databases } = require("../config/appwrite"); // Add this import!

const DB_ID = process.env.APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.APPWRITE_COLLECTION_ID;

router.use(authenticateUser);

// Your existing routes
router.post("/", invoiceController.create);
router.get("/", invoiceController.list);
router.get("/summary", invoiceController.summary);
router.patch("/:id/pay", invoiceController.markPaid);

// Fixed PDF download route
router.get("/:id/pdf", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Get the invoice from database
    const invoice = await databases.getDocument(DB_ID, COLLECTION_ID, id);

    // Check if user owns this invoice
    if (invoice.userId !== userId) {
      return res.status(403).json({
        error: "Unauthorized access to this invoice",
      });
    }

    // Generate the PDF
    const pdfResult = await generateInvoicePDF(invoice);

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${pdfResult.filename}`
    );

    // Send the file
    const fs = require("fs");
    const fileStream = fs.createReadStream(pdfResult.filepath);

    fileStream.pipe(res);

    // Clean up after sending
    fileStream.on("end", () => {
      if (fs.existsSync(pdfResult.filepath)) {
        fs.unlinkSync(pdfResult.filepath);
        console.log(`🧹 Cleaned up PDF: ${pdfResult.filename}`);
      }
    });
  } catch (error) {
    console.error("PDF download error:", error);
    res.status(500).json({
      error: "Failed to generate PDF",
      message: error.message,
    });
  }
});

module.exports = router;
