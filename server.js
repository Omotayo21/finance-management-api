require("dotenv").config();
const express = require("express");
const cors = require("cors");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
require("dotenv").config();
app.get("/", (req, res) => {
  res.json({
    message: "Finance API is running",
    version: "1.0.0",
    endpoints: {
      createInvoice: "POST /api/invoices",
      listInvoices: "GET /api/invoices",
      markAsPaid: "PATCH /api/invoices/:id/pay",
      getSummary: "GET /api/invoices/summary",
    },
  });
});

app.use("/api/invoices", invoiceRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
