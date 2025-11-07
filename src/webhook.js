import dotenv from "dotenv";
dotenv.config();

import { app, logger } from "./index.js";

const PORT = process.env.PORT || 5000;

try {
  app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));
} catch (error) {
  logger.error(`❌ Webhook error: ${error.message}`, error);
}
