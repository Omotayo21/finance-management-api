const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

async function generatePDFOnly(invoice) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filename = `invoice-${invoice.invoiceNumber}.pdf`;
      const filepath = path.join(tempDir, filename);

      const writeStream = fs.createWriteStream(filepath);

      doc.pipe(writeStream);

      doc.fontSize(20).text("INVOICE", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(`Invoice Number: ${invoice.invoiceNumber}`)
        .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`)
        .text(`Client: ${invoice.clientName}`)
        .text(`Status: ${invoice.status}`);
      doc.moveDown();
      doc.text("Amount Details:", { underline: true });
      doc.moveDown(0.5);
      doc
        .text(`Subtotal: $${invoice.amount.toFixed(2)}`)
        .text(`VAT (${invoice.vatRate}%): $${invoice.vatAmount.toFixed(2)}`)
        .moveDown(0.5)
        .fontSize(14)
        .text(`TOTAL: $${invoice.total.toFixed(2)}`, { underline: true });
      doc.moveDown(2);
      doc
        .fontSize(10)
        .text("Thank you for your business!", { align: "center" });

      doc.end();

      writeStream.on("finish", () => {
        console.log(`PDF generated: ${filename}`);
        resolve({
          success: true,
          message: "PDF generated successfully",
          filename: filename,
          filepath: filepath,
          stored: false,
        });
      });

      writeStream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePDFOnly };
