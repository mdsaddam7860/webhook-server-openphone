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
    contacts = await searchContacts();
    logger.info(`Contacts Lenght: ${contacts.length}`);

    for (const contact of contacts) {
      // logger.info(`Contacts : ${JSON.stringify(contact)}`);
      try {
        await handleWebhook(contact);
      } catch (error) {
        logger.error(`Failed to sync contact to HubSpot`, error);
      }
    }
    logger.info(`✅ Found ${contacts.length} contacts to sync to HubSpot`);
  } catch (error) {
    logger.error(`Failed to sync to HubSpot`, error);
    return;
  }
}

export { syncToHubspot };
