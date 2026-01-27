import cron from "node-cron";
import { syncToHubspot, logger, syncOnlyCompltedRecords } from "../index.js";

let isJobRunning = false;
let isJobRunning2 = false;

logger.info("✅ Scheduler Initialized Every Hour at minute 0 syncToHubspot");

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

logger.info("✅ Scheduler Initialized syncOnlyCompltedRecords");

// Scheduler will Run Every 2 minute at the 30th second
cron.schedule("30 */2 * * * *", async () => {
  if (isJobRunning2) {
    logger.info("⏭ Previous job still running, skipping this run.");
    return;
  }

  isJobRunning2 = true;
  // logger.info(
  //   "🚀 Starting sync whose  of_times_sms_sent is 1 and sync_completed is false job"
  // );

  try {
    await syncOnlyCompltedRecords();
  } catch (error) {
    logger.error(`❌ Scheduler error: ${error.message}`, error);
  } finally {
    isJobRunning2 = false;
    logger.info("✅ syncOnlyCompltedRecords job finished");
  }
});
