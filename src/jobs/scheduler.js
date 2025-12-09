import cron from "node-cron";
import { syncToHubspot, logger } from "../index.js";

let isJobRunning = false;

logger.info("✅ Scheduler started");

//  Scheduler Will Run Every hour at minute 0
cron.schedule("0 * * * *", async () => {
  // every hour minutes
  if (isJobRunning) {
    logger.info("⏭ Previous job still running, skipping this run.");
    return;
  }

  isJobRunning = true;
  logger.info("🚀 Starting syncToHubspot job");

  try {
    await syncToHubspot();
  } catch (error) {
    logger.error(`❌ Scheduler error: ${error.message}`, error);
  } finally {
    isJobRunning = false;
    logger.info("✅ syncToHubspot job finished");
  }
});
