import {
  axios,
  app,
  logger,
  router,
  getContact,
  updatePhone,
  getMessageTemplates,
  getMessages,
  sendMessage,
  handleWebhook,
  searchContacts,
} from "../index.js";

async function syncToHubspot() {
  let contacts = [];
  try {
    // 🔍 Fetch contacts within window
    contacts = await searchContacts();
    logger.info(`Contacts Length: ${contacts.length}`);

    for (const contact of contacts) {
      try {
        if (contact.properties.of_times_sms_sent !== 1) {
          await handleWebhook(contact);
        }
      } catch (error) {
        logger.error(`Failed to sync contact to HubSpot`, error);
      }
    }
  } catch (error) {
    logger.error(`Failed to sync to HubSpot`, error);
    return;
  }
}

export { syncToHubspot };
