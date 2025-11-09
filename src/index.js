import { app, router } from "./app.js";
import { logger } from "./utils/logger.js";
import {
  getContact,
  updatePhone,
  getMessageTemplates,
  searchContacts,
} from "./services/hubspotService.js";
import { getMessages, sendMessage } from "./services/openphoneService.js";
import { handleWebhook, handleWebhook2 } from "./routes/webhook.js";
import axios from "axios";

import { syncToHubspot } from "./controllers/hubspot.controller.js";
import { getLastSyncTime, saveLastSyncTime } from "./utils/lastSyncTime.js";

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
  searchContacts,
  syncToHubspot,
  handleWebhook2,
  getLastSyncTime,
  saveLastSyncTime,
};
