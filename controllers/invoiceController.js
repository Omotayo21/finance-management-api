const invoiceService = require("../services/invoiceService");

async function create(req, res) {
  try {
    const { clientName, amount, vatRate } = req.body;

    if (!clientName || !amount) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["clientName", "amount"],
      });
    }

    const invoice = await invoiceService.createInvoice(
      req.userId,
      clientName,
      parseFloat(amount),
      vatRate ? parseFloat(vatRate) : 7.5
    );

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create invoice",
      message: error.message,
    });
  }
}

async function list(req, res) {
  try {
    const { status } = req.query;
    const invoices = await invoiceService.listInvoices(req.userId, status);

    res.json({
      message: "Invoices retrieved successfully",
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to list invoices",
      message: error.message,
    });
  }
}

async function markPaid(req, res) {
  try {
    const { id } = req.params;
    const invoice = await invoiceService.markAsPaid(id, req.userId);

    res.json({
      message: "Invoice marked as paid and notification sent",
      invoice,
    });
  } catch (error) {
    const statusCode = error.message.includes("Unauthorized")
      ? 403
      : error.message.includes("already")
      ? 400
      : 500;

    res.status(statusCode).json({
      error: "Failed to mark invoice as paid",
      message: error.message,
    });
  }
}

async function summary(req, res) {
  try {
    const summaryData = await invoiceService.getSummary(req.userId);

    res.json({
      message: "Summary retrieved successfully",
      summary: summaryData,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get summary",
      message: error.message,
    });
  }
}

module.exports = {
  create,
  list,
  markPaid,
  summary,
};
