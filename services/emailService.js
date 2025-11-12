const { messaging } = require("../config/appwrite");
const { ID } = require("node-appwrite");

async function sendPaymentNotification(invoice) {
  try {
    const subject = `Payment Received - Invoice ${invoice.invoiceNumber}`;

    const emailContent = `
Hello,

Great news! Invoice ${invoice.invoiceNumber} for ${
      invoice.clientName
    } has been marked as PAID.

Invoice Details:
- Client: ${invoice.clientName}
- Invoice Number: ${invoice.invoiceNumber}
- Amount: $${invoice.amount.toFixed(2)}
- VAT (${invoice.vatRate}%): $${invoice.vatAmount.toFixed(2)}
- Total Paid: $${invoice.total.toFixed(2)}

Thank you for your business!

Best regards,
Finance Management Team
    `.trim();

    let targetId;
    try {
      const target = await messaging.createSubscriber(
        "69135d2f00140c21a3f6",
        ID.unique(),
        ID.unique()
      );
      targetId = target.$id;
    } catch (e) {
      console.log("Using existing target");
    }

    const message = await messaging.createEmail(
      ID.unique(),
      subject,
      emailContent,
      ["69135d2f00140c21a3f6"]
    );

    console.log("EMAIL SENT SUCCESSFULLY via Appwrite + SendGrid");

    return true;
  } catch (error) {
    console.error("Failed to send email:", error.message);
    console.error("Error details:", error);
    return false;
  }
}

module.exports = { sendPaymentNotification };
