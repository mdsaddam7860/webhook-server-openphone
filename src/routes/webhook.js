import {
  logger,
  router,
  getContact,
  updatePhone,
  getMessageTemplates,
  getMessages,
  sendMessage,
} from "../index.js";

const FROM_NUMBER = "+12016446523";

// ✅ Main webhook handler
async function handleWebhook2(req, res) {
  logger.info("📩 Webhook received");
  res.status(204).send();

  // Process asynchronously to avoid HubSpot timeout
  setImmediate(async () => {
    try {
      let requestBody = req.body;
      if (typeof requestBody === "string") {
        requestBody = JSON.parse(requestBody);
      }

      const { objectId } = requestBody[0] || {};
      if (!objectId) {
        logger.warn("❌ Missing objectId in webhook payload");
        return;
      }

      logger.info(`📦 Processing contact with objectId: ${objectId}`);

      // ✅ Fetch contact from HubSpot
      const contact = await getContact(objectId);
      const firstName = contact.properties.firstname || "there";
      const toPhoneNumber = contact.properties.phone;

      if (!toPhoneNumber) {
        logger.warn(`❌ No phone number found for contact ID ${objectId}`);
        return;
      }

      // ✅ Format phone number (E.164 format)
      let toPhoneNumberFormatted = toPhoneNumber;
      const cleanNumber = toPhoneNumber.replace(/\D/g, ""); // remove non-digits

      if (!toPhoneNumber.startsWith("+")) {
        if (cleanNumber.length === 10) {
          toPhoneNumberFormatted = `+1${cleanNumber}`;
        } else if (cleanNumber.length === 11 && cleanNumber.startsWith("1")) {
          toPhoneNumberFormatted = `+${cleanNumber}`;
        } else {
          toPhoneNumberFormatted = `+1${cleanNumber}`;
        }

        logger.info(
          `📞 Formatting phone number: ${toPhoneNumber} → ${toPhoneNumberFormatted}`
        );

        // ✅ Update the phone number in HubSpot
        try {
          await updatePhone(objectId, toPhoneNumberFormatted);
          logger.info(`✅ Phone number updated in HubSpot for ID ${objectId}`);
        } catch (err) {
          logger.warn(
            `⚠️ Failed to update phone number in HubSpot: ${err.message}`
          );
        }
      }

      // ✅ Check if user already replied in OpenPhone
      const messages = await getMessages(toPhoneNumberFormatted);
      const userReplied = messages.some((msg) => msg.to.includes(FROM_NUMBER));

      if (userReplied) {
        logger.info(`✅ User ${toPhoneNumberFormatted} has already replied`);
        return;
      }

      // ✅ Get message template
      const templates = await getMessageTemplates();
      const messageById = templates.find(
        (item) => item.message === contact.properties.of_times_sms_sent
      )?.message_text;

      if (!messageById) {
        logger.warn(
          `❌ No message text found for of_times_sms_sent: ${contact.properties.of_times_sms_sent}`
        );
        return;
      }

      // ✅ Personalize message content
      const content = messageById.replace("{First Name}", firstName);

      // ✅ Send SMS via OpenPhone
      await sendMessage(toPhoneNumberFormatted, content);
      logger.info(`✅ Message sent successfully to ${toPhoneNumberFormatted}`);
    } catch (error) {
      logger.error(`❌ Webhook processing failed: ${error.message}`);
      return;
    } finally {
      logger.info("✅ Webhook processed");
    }
  });
}

// ✅ Webhook handler for single contact
async function handleWebhook(contactPayload) {
  try {
    let payload = contactPayload;
    if (typeof payload === "string") {
      payload = JSON.parse(payload);
    }

    // New
    const contactData = Array.isArray(payload) ? payload[0] : payload;
    const objectId =
      contactData.objectId ||
      contactData.id ||
      contactData.properties?.hs_object_id;

    if (!objectId) {
      logger.warn("❌ Missing objectId in webhook payload");
      return;
    }

    logger.info(`📦 Processing contact with objectId: ${objectId}`);

    // Fetch contact from HubSpot
    // const contact = await getContact(objectId);
    const contact = contactPayload;
    if (!contact || !contact.properties) {
      logger.warn(`❌ Contact not found in HubSpot: ${objectId}`);
      return;
    }

    const firstName = contact.properties.firstname || "there";
    const rawPhone = contact.properties.phone;

    if (!rawPhone) {
      logger.warn(`❌ No phone number found for contact ID ${objectId}`);
      return;
    }

    // Format phone number (E.164)
    const cleanNumber = rawPhone.replace(/\D/g, "");
    let formattedPhone = rawPhone;

    if (!rawPhone.startsWith("+")) {
      if (cleanNumber.length === 10) {
        formattedPhone = `+1${cleanNumber}`;
      } else if (cleanNumber.length === 11 && cleanNumber.startsWith("1")) {
        formattedPhone = `+${cleanNumber}`;
      } else {
        formattedPhone = `+1${cleanNumber}`;
      }

      logger.info(
        `📞 Formatting phone number: ${rawPhone} → ${formattedPhone}`
      );

      // Update phone number in HubSpot
      try {
        await updatePhone(objectId, formattedPhone);
        logger.info(`✅ Phone number updated in HubSpot for ID ${objectId}`);
      } catch (err) {
        logger.warn(`⚠️ Failed to update phone number: ${err.message}`);
      }
    }

    // Check if user already replied in OpenPhone
    const messages = await getMessages(formattedPhone);
    const userReplied = messages.some((msg) => msg.to.includes(FROM_NUMBER));
    if (userReplied) {
      logger.info(`✅ User ${formattedPhone} has already replied`);
      return;
      // return res
      //   .status(200)
      //   .json({ success: true, message: "User has already replied" });
    }

    // Get message template
    const templates = await getMessageTemplates();
    const templateText = templates.find(
      (item) => item.message === contact.properties.of_times_sms_sent
    )?.message_text;

    logger.info(
      `✅ Message template:${contact.properties.of_times_sms_sent} ---${templateText}`
    );

    if (!templateText) {
      logger.warn(
        `❌ No message template found for of_times_sms_sent: ${contact.properties.of_times_sms_sent}`
      );
      return;
    }

    // Personalize message
    const messageContent = templateText.replace("{First Name}", firstName);

    // Send SMS
    await sendMessage(formattedPhone, messageContent);
    logger.info(`✅ Message sent successfully to ${formattedPhone}`);
  } catch (error) {
    logger.error(`❌ Webhook processing failed:`, error);
  }
}
// ✅ Attach the handler
// router.post("/", handleWebhook);

export { handleWebhook, handleWebhook2 };
