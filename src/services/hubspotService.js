import { logger } from "../index.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function getContact(objectId) {
  const url = `https://api.hubapi.com/crm/v3/objects/contacts/${objectId}?properties=firstname,phone,hs_analytics_source,of_times_sms_sent`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    logger.error(`HubSpot contact fetch failed: ${error.message}`);
    throw error;
  }
}

async function updatePhone(objectId, phone) {
  try {
    await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${objectId}`,
      { properties: { phone } },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    logger.info(`✅ Phone updated for contact ID ${objectId}`);
  } catch (error) {
    logger.warn(`⚠️ Failed to update phone: ${error.message}`);
  }
}

async function getMessageTemplates() {
  try {
    const res = await axios.get(
      "https://api.hubapi.com/crm/v3/objects/2-45109637?properties=message_,message_text&limit=100",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.results.map((item) => ({
      message: item.properties.message_,
      message_text: item.properties.message_text,
    }));
  } catch (error) {
    logger.error(
      `❌ Failed to fetch HubSpot message templates: ${error.message}`
    );
    throw error;
  }
}

export { getContact, updatePhone, getMessageTemplates };
