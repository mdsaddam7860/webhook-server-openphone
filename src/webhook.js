// import "./configs/config.js";
import "./jobs/scheduler.js";

import { app, logger, syncToHubspot } from "./index.js";

const PORT = process.env.PORT || 5000;

try {
  app.listen(PORT, () => {
    // syncToHubspot();
    logger.info(`🚀 Server running on port ${PORT}`);
  });
} catch (error) {
  logger.error(`❌ Webhook error: ${error.message}`, error);
}
