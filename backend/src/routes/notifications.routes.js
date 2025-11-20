/**
 * @fileoverview API endpoints for ses notifications.
 * @version 0.3.2
 * @author EXACTUM-dev
 */

import express from "express";
const router = express.Router();

router.post("/notifications", express.json(), async (req, res) => {
  console.log("SNS RAW BODY:", JSON.stringify(req.body, null, 2));
  const messageType = req.headers["x-amz-sns-message-type"];
  const message = req.body;
  console.log(message);

  // Confirm the subscription
  if (messageType === "SubscriptionConfirmation") {
    await fetch(message.SubscribeURL);
    return res.status(200).send("Subscription confirmed");
  }

  if (messageType === "Notification") {
    const snsMessage = JSON.parse(message.Message);

    if (snsMessage.notificationType === "Bounce") {
      console.log("Bounce detected:", snsMessage);
      // Marcar el correo como inválido en tu DB
    }

    if (snsMessage.notificationType === "Complaint") {
      console.log("Complaint detected:", snsMessage);
      // Desuscribir o pausar envíos a este correo
    }

    if (snsMessage.notificationType === "Delivery") {
      console.log("Delivery:", snsMessage);
    }
  }

  res.status(200).send("OK");
});

export default router;
