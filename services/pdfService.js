const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { storage } = require("../config/appwrite");
const { InputFile, ID } = require("node-appwrite");

async function generateAndUploadPDF(invoice) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filename = `invoice-${invoice.invoiceNumber}.pdf`;
      const filepath = path.join(__dirname, "../../", filename);
      const writeStream = fs.createWriteStream(filepath);

      doc.pipe(writeStream);

      writeStream.on("finish", async () => {
        try {
          const file = await storage.createFile(
            process.env.APPWRITE_BUCKET_ID,
            ID.unique(),
            InputFile.fromPath(filepath, filename)
          );

          // Clean up the temporary file
          fs.unlinkSync(filepath);

          resolve(file.$id);
        } catch (uploadError) {
          // Clean up on error too
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
          reject(uploadError);
        }
      });

      doc.fontSize(20).text("INVOICE", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
      doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
      doc.text(`Client: ${invoice.clientName}`);
      doc.moveDown();
      doc.text(`Amount: $${invoice.amount.toFixed(2)}`);
      doc.text(`VAT (${invoice.vatRate}%): $${invoice.vatAmount.toFixed(2)}`);
      doc
        .fontSize(14)
        .text(`Total: $${invoice.total.toFixed(2)}`, { underline: true });
      doc.moveDown();
      doc.fontSize(10).text(`Status: ${invoice.status}`);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateAndUploadPDF };
