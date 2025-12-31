// // config.js
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Load .env from root folder explicitly
// dotenv.config({ path: path.join(__dirname, "../../.env") });

import { createClient } from "@mohammadsaddam-dev/hubspot-toolkit";

let hs_client = null;

function getHubspotClient() {
  if (hs_client) {
    return hs_client;
  }

  if (process.env.HUBSPOT_ACCESS_TOKEN) {
    return (hs_client = createClient({
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
    }));
  }

  return null;
}

export { hs_client, getHubspotClient };
