import cron from "node-cron";
import { syncToHubspot, logger } from "../index.js";
logger.info("✅ Scheduler started");

// Scheduler will run every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  try {
    await syncToHubspot();
  } catch (error) {
    logger.error(`❌ Scheduler error: ${error.message}`, error);
  }
});
