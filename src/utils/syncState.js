import fs from "fs/promises";
import path from "path";

const STATE_FILE = path.resolve("data/syncState.json");

/**
 * Read sync state from file
 */
async function readSyncState() {
  try {
    const data = await fs.readFile(STATE_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // First run or file missing
    return { contactsLastSync: null };
  }
}

/**
 * Update sync state safely
 */
async function writeSyncState(partialState) {
  const currentState = await readSyncState();

  const nextState = {
    ...currentState,
    ...partialState,
  };

  await fs.writeFile(STATE_FILE, JSON.stringify(nextState, null, 2), "utf-8");
}

export { readSyncState, writeSyncState };
