import { logger } from "../index.js";
import axios from "axios";
// import d`otenv from "dotenv";
// dotenv.config();`

const FROM_NUMBER = "+12016446523";

async function getMessages(toNumber) {
  try {
    if (!toNumber) {
      console.log("no number");
      return;
    }
    const response = await axios.get(
      `https://api.openphone.com/v1/messages?maxResults=10&phoneNumberId=PNBMjYijdv&participants=${encodeURIComponent(
        toNumber
      )}`,
      {
        headers: {
          Authorization: process.env.OPENPHONE_API_KEY,
        },
      }
    );
    return response.data.data || [];
  } catch (error) {
    logger.error(
      `❌ Failed to fetch OpenPhone messages: ${error.message}`,
      error
    );
    return [];
  }
}

async function sendMessage(to, content) {
  try {
    const response = await axios.post(
      process.env.OPENPHONE_API_URL,
      { content, from: FROM_NUMBER, to: [to] },
      {
        headers: {
          Authorization: process.env.OPENPHONE_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (response) {
      logger.info(
        `✅ Message sent to ${to} : ${JSON.stringify(response.data)}`
      );
    }
  } catch (error) {
    logger.error(`❌ Failed to send message: ${error.message}`, error);
    throw error;
  }
}

export { getMessages, sendMessage };
