/**
 * @fileoverview API endpoints for ses notifications.
 * @version 0.3.2
 * @author EXACTUM-dev
 */

import express from "express";
const router = express.Router();

router.post("/ses/notifications", express.text({ type: "*/*" }), async (req, res, next) => {
  try {
    console.log("SNS RAW BODY:", req.body);

    if (!req.body) {
      throw new Error("SNS payload vacío");
    }

    // SNS envía texto plano → convertir a JSON
    const message = JSON.parse(req.body);

    console.log("SNS PARSED MESSAGE:", message);

    // Confirmación de suscripción
    if (message.Type === "SubscriptionConfirmation") {
      console.log("Confirmando suscripción SNS...");

      const response = await fetch(message.SubscribeURL);
      console.log("SNS confirm response:", response.status);

      return res.status(200).json({ ok: true, message: "SNS subscription confirmed" });
    }

    // Manejo de notificaciones reales (SES bounces o complaints)
    if (message.Type === "Notification") {
      const inner = JSON.parse(message.Message);
      console.log("SES EVENT:", inner);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error interno en SNS route:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
