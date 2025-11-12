import cron from "node-cron";
import { syncToHubspot, logger } from "../index.js";
logger.info("✅ Scheduler started");

// Scheduler will run every hour at minute 0
cron.schedule("0 * * * *", async () => {
  try {
    await syncToHubspot();
  } catch (error) {
    logger.error(`❌ Scheduler error: ${error.message}`, error);
  }
});
