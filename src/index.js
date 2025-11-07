import { app, router } from "./app.js";
import { logger } from "./utils/logger.js";
import {
  getContact,
  updatePhone,
  getMessageTemplates,
} from "./services/hubspotService.js";
import { getMessages, sendMessage } from "./services/openphoneService.js";
import { handleWebhook } from "./routes/webhook.js";
import axios from "axios";

export {
  axios,
  app,
  logger,
  router,
  getContact,
  updatePhone,
  getMessageTemplates,
  getMessages,
  sendMessage,
  handleWebhook,
};
