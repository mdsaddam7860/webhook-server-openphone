import fs from "fs";

function getLastSyncTime() {
  try {
    return new Date(fs.readFileSync("./lastSyncTime.txt", "utf8"));
  } catch {
    // Default to 1 hour ago if file doesn’t exist
    return new Date(Date.now() - 60 * 60 * 1000);
  }
}

function saveLastSyncTime(time) {
  fs.writeFileSync("./lastSyncTime.txt", time.toISOString());
}

export { getLastSyncTime, saveLastSyncTime };
