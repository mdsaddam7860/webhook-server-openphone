import "dotenv/config";
import "./jobs/scheduler.js";

import { app, logger, getHubspotClient } from "./index.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

getHubspotClient();
