const { databases } = require("../config/appwrite");
const { ID, Query } = require("node-appwrite");
const { calculateVAT } = require("../utils/vatCalculator");
const { generateInvoiceNumber } = require("../utils/invoiceGenerator");
const { generatePDFOnly } = require("./pdfService");
const { sendPaymentNotification } = require("./emailService");

const DB_ID = process.env.APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.APPWRITE_COLLECTION_ID;

async function createInvoice(userId, clientName, amount, vatRate = 7.5) {
  const { vatAmount, total } = calculateVAT(amount, vatRate);
  const invoiceNumber = generateInvoiceNumber();

  const invoiceData = {
    userId,
    clientName,
    amount,
    vatRate,
    vatAmount,
    total,
    status: "Unpaid",
    invoiceNumber,
    createdAt: new Date().toISOString(),
  };

  const doc = await databases.createDocument(
    DB_ID,
    COLLECTION_ID,
    ID.unique(),
    invoiceData
  );

  generatePDFOnly(doc)
    .then((fallbackResult) => {
      console.log(`PDF generated locally: ${fallbackResult.filename}`);
    })
    .catch((fallbackError) => {
      console.error(`PDF failed:`, fallbackError.message);
    });
}

async function listInvoices(userId, status = null) {
  const queries = [Query.equal("userId", userId)];

  if (status) {
    queries.push(Query.equal("status", status));
  }

  const response = await databases.listDocuments(DB_ID, COLLECTION_ID, queries);

  return response.documents;
}

async function markAsPaid(invoiceId, userId) {
  const invoice = await databases.getDocument(DB_ID, COLLECTION_ID, invoiceId);

  if (invoice.userId !== userId) {
    throw new Error("Unauthorized access to this invoice");
  }

  if (invoice.status === "Paid") {
    throw new Error("Invoice is already marked as paid");
  }

  const updatedInvoice = await databases.updateDocument(
    DB_ID,
    COLLECTION_ID,
    invoiceId,
    { status: "Paid" }
  );

  await sendPaymentNotification(updatedInvoice);

  return updatedInvoice;
}

async function getSummary(userId) {
  const allInvoices = await listInvoices(userId);

  const totalRevenue = allInvoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalVAT = allInvoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.vatAmount, 0);

  const outstandingAmount = allInvoices
    .filter((inv) => inv.status === "Unpaid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const outstandingCount = allInvoices.filter(
    (inv) => inv.status === "Unpaid"
  ).length;

  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalVAT: parseFloat(totalVAT.toFixed(2)),
    outstandingAmount: parseFloat(outstandingAmount.toFixed(2)),
    outstandingInvoices: outstandingCount,
    totalInvoices: allInvoices.length,
    paidInvoices: allInvoices.filter((inv) => inv.status === "Paid").length,
  };
}

module.exports = {
  createInvoice,
  listInvoices,
  markAsPaid,
  getSummary,
};
