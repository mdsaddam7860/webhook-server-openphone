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
  getHubspotClient,
} from "../index.js";

// const hs_client = getHubspotClient();

async function syncToHubspot() {
  let contacts = [];
  try {
    // 🔍 Fetch contacts within window
    contacts = await searchContacts();
    logger.info(`Contacts Length: ${contacts.length}`);

    for (const contact of contacts) {
      try {
        const rawValue = contact?.properties?.of_times_sms_sent;

        // 🚫 Skip undefined / null / non-numeric / first SMS
        const timesSmsSent = Number(rawValue);

        if (
          rawValue == null || // undefined or null
          Number.isNaN(timesSmsSent) ||
          timesSmsSent === 1
        ) {
          logger.info(`Skipping contact ${contact?.id}: of_times_sms_sent=1`);
          continue;
        }

        await handleWebhook(contact);
        const hs_client = getHubspotClient();

        const updateContact = await hs_client.contacts.updateContact(
          contact.id,
          {
            sync_completed: true,
          }
        );

        logger.info(
          `✅ sync_completed updated for contact ID ${
            contact.id
          }: ${JSON.stringify(updateContact, null, 2)}`
        );
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
