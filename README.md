# Finance Backend (Express + Appwrite) - Final

This final version includes:
- Appwrite Messaging (email notifications) when an invoice is marked Paid
- Optional PDF generation + upload to Appwrite Storage (easy to disable)
- Express.js API with modular structure

## Quick commands
- Install dependencies: `npm install`
- Run (dev): `npm run dev`

## Environment
Copy `.env.example` to `.env` and fill in values.

## Endpoints
- `POST /api/invoices` - create invoice (generates optional PDF)
- `GET  /api/invoices?status=paid|unpaid` - list invoices
- `PATCH /api/invoices/:id/pay` - mark invoice as paid (sends Appwrite email)
- `GET  /api/invoices/summary` - get totals

## How PDF is optional
The PDF generation/upload happens inside `services/invoiceService.js` in the `maybeGenerateAndUploadPDF()` function.
To **disable PDF storage**, remove or comment out the call to `maybeGenerateAndUploadPDF()` inside `createInvoice()` in the same file.

## Appwrite setup notes
- Create project, Database, Collection for `invoices` (fields used: userId, amount, vatAmount, total, status, pdfFileId)
- Create a Storage bucket and set `APPWRITE_BUCKET_ID`
- Ensure Messaging is enabled in Appwrite for sending emails, and your Appwrite project allows sending messages (Appwrite cloud may require verified domain/email)
- You can use either user JWTs (frontend passes `Authorization: Bearer <JWT>`) or a server API key (set `APPWRITE_API_KEY`) — both supported.
