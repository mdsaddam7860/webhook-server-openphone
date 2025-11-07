import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { handleWebhook } from "./index.js";

const router = express.Router();

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.get("/", (req, res) => res.send("<h1>🚀 App is running</h1>"));
app.post("/webhook", handleWebhook);

export { app, router };
