import {
  logger,
  getCompletedContacts,
  handleWebhook,
  getHubspotClient,
} from "../index.js";
// const hs_client = getHubspotClient();

const toBool = (value) => value === "true";
async function syncOnlyCompltedRecords() {
  try {
    const allContacts = await getCompletedContacts();

    if (allContacts.length === 0) {
      logger.info(`No contacts to process`);
      return;
    }
    logger.info(`Contacts Length: ${allContacts.length}`);

    for (const contact of allContacts) {
      try {
        const rawValue = contact?.properties?.of_times_sms_sent;

        // 🚫 Skip undefined / null / non-numeric / sync_completed
        const timesSmsSent = Number(rawValue);
        const sync_completed = toBool(contact?.properties?.sync_completed);

        if (
          rawValue == null ||
          Number.isNaN(timesSmsSent) ||
          timesSmsSent !== 1 ||
          sync_completed
        ) {
          logger.info(
            `Skipping contact ${contact?.id}: of_times_sms_sent is not equal 1 or sync_completed is true`
          );
          continue;
        }

        await handleWebhook(contact);
      } catch (error) {
        logger.error(
          `❌ syncOnlyCompltedRecords processing failed:`,
          error?.response?.data || error
        );
        // Update Contact here

        try {
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
            }: ${JSON.stringify(updateContact)}`
          );
        } catch (error) {
          logger.error(
            `❌ syncOnlyCompltedRecords processing failed:`,
            error?.response?.data || error
          );
        }
      }
    }
  } catch (error) {
    logger.error(
      `❌ syncOnlyCompltedRecords processing failed:`,
      error?.response?.data || error
    );
  }
}

export { syncOnlyCompltedRecords };
