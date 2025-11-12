const sdk = require("node-appwrite");

const client = new sdk.Client();

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const storage = new sdk.Storage(client);
const messaging = new sdk.Messaging(client);

module.exports = {
  client,
  databases,
  storage,
  messaging,
};
