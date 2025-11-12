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

    // Create email target on the fly
    let targetId;
    try {
      const target = await messaging.createSubscriber(
        "69135d2f00140c21a3f6", // Your topic ID
        ID.unique(), // Subscriber ID
        ID.unique() // Target ID (will create new email target)
      );
      targetId = target.$id;
    } catch (e) {
      // Target might already exist, continue anyway
      console.log("Using existing target");
    }

    // Send email to topic
    const message = await messaging.createEmail(
      ID.unique(),
      subject,
      emailContent,
      ["69135d2f00140c21a3f6"] // Your topic ID
    );

    console.log("\n" + "═".repeat(70));
    console.log("✅ EMAIL SENT SUCCESSFULLY via Appwrite + SendGrid");
    console.log("═".repeat(70));
    console.log("Message ID:", message.$id);
    console.log("Subject:", subject);
    console.log("Check your inbox:", process.env.SENDGRID_FROM_EMAIL);
    console.log("═".repeat(70) + "\n");

    return true;
  } catch (error) {
    console.error("\n✗ Failed to send email:", error.message);
    console.error("Error details:", error);
    return false;
  }
}

module.exports = { sendPaymentNotification };
