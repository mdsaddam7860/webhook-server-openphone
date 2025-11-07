import express from "express";
// config.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root folder explicitly
dotenv.config({ path: path.join(__dirname, ".env") });

import { handleWebhook } from "./index.js";

const router = express.Router();

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.get("/", (req, res) => res.send("<h1>App is running</h1>"));
app.post("/webhook", handleWebhook);

export { app, router };
