import {
  logger,
  getLastSyncTime,
  saveLastSyncTime,
  hs_client,
} from "../index.js";
import axios from "axios";
// import dotenv from "dotenv";
// dotenv.config();

async function getContact(objectId) {
  const url = `https://api.hubapi.com/crm/v3/objects/contacts/${objectId}?properties=firstname,phone,hs_analytics_source,of_times_sms_sent,sync_completed`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    logger.error(`HubSpot contact fetch failed:`, error);
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
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
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
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
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

// const today = new Date();
// const yesterday = new Date(today);
// yesterday.setDate(today.getDate() - 1);

// const yesterdayDateISO = yesterday.toISOString();
// async function searchContacts() {
//   try {
//     const now = new Date();
//     const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour in milliseconds

//     const oneHourAgoISO = oneHourAgo.toISOString();

//     const searchRequest = {
//       filterGroups: [
//         {
//           filters: [
//             {
//               propertyName: "text_delta",
//               operator: "GTE",
//               value: oneHourAgoISO,
//             },
//           ],
//         },
//       ],
//       properties: [
//         "firstname",
//         "phone",
//         "of_times_sms_sent",
//         "lastmodifieddate",
//       ],
//       limit: 100,
//     };

//     // ✅ HubSpot search endpoint
//     const response = await axios.post(
//       `https://api.hubapi.com/crm/v3/objects/contacts/search`,
//       searchRequest,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
//         },
//       }
//     );

//     return response.data.results || [];
//   } catch (err) {
//     logger.error(`❌ Failed to search contacts from yesterday: ${err.message}`);
//     return [];
//   }
// }

// 2025-11-09T18:25:45.198Z
async function searchContacts() {
  try {
    const lastSyncTime = getLastSyncTime();
    const currentSyncTime = new Date();

    console.log("lastSyncTime", lastSyncTime);

    const searchRequest = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "text_delta",
              operator: "GTE",
              value: lastSyncTime.toISOString(),
            },
            {
              propertyName: "text_delta",
              operator: "LTE",
              value: currentSyncTime.toISOString(),
            },
          ],
        },
      ],
      properties: [
        "firstname",
        "phone",
        "of_times_sms_sent",
        "lastmodifieddate",
      ],
      limit: 100,
    };

    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/contacts/search",
      searchRequest,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
        },
      }
    );

    logger.info(
      `🔍 Searching contacts where text_delta between ${lastSyncTime.toISOString()} and ${currentSyncTime.toISOString()}`
    );

    // ✅ Save the current sync time only after successful fetch
    saveLastSyncTime(currentSyncTime);

    return response.data.results || [];
  } catch (err) {
    logger.error(`❌ Failed to search contacts:`, err);
    return [];
  }
}

async function getCompletedContacts() {
  try {
    const filterGroups = [
      {
        filters: [
          {
            propertyName: "of_times_sms_sent",
            operator: "EQ",
            value: "1",
          },
          {
            propertyName: "sync_completed",
            operator: "EQ",
            value: "false",
          },
        ],
      },
    ];

    const properties = [
      "firstname",
      "lastname",
      "sync_completed",
      "of_times_sms_sent",
      "phone",
    ];
    let allContacts = [];
    const limit = 100;
    let after = null;

    do {
      const contact = await hs_client.contacts.searchContacts(
        filterGroups,
        properties,
        limit,
        after
      );

      allContacts.push(...contact.results);

      if (contact?.paging?.next?.after) {
        after = contact?.paging?.next?.after;
      } else {
        after = 0;
      }
    } while (after);

    return allContacts;
  } catch (error) {
    logger.error(
      `❌ Failed to fetch completed contacts:`,
      error?.response?.data || error
    );
    return [];
  }
}

export {
  getContact,
  updatePhone,
  getMessageTemplates,
  searchContacts,
  getCompletedContacts,
};
