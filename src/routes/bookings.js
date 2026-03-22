import { Router } from "express";
import { requireFields, parseDateTime } from "../utils/validate.js";
import { createCalendarEvent } from "../services/googleCalendar.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    requireFields(req.body, ["name", "phone", "service", "barber", "start", "end"]);

    const { name, phone, email, service, barber, notes, start, end } = req.body;

    const startDt = parseDateTime(start);
    const endDt = parseDateTime(end);

    if (endDt <= startDt) {
      return res.status(400).json({ error: "End time must be after start" });
    }

    const tz = process.env.TIMEZONE || "America/Los_Angeles";

    const summary = `${service} - ${name} with ${barber}`;

    const description = [
      `Customer: ${name}`,
      `Phone: ${phone}`,
      email ? `Email: ${email}` : null,
      `Service: ${service}`,
      `Barber: ${barber}`,
      notes ? `Notes: ${notes}` : null
    ]
      .filter(Boolean)
      .join("\n");

    const event = await createCalendarEvent({
      summary,
      description,
      start: startDt.toISOString(),
      end: endDt.toISOString(),
      timeZone: tz
    });

    return res.json({
      ok: true,
      confirmation: event?.id || `TEMP-${Date.now()}`,
      eventLink: event?.htmlLink
    });

  
} catch (err) {
  console.error("BOOKING ERROR:", err);   // <-- ADD THIS LINE
  const code = err.code && Number.isInteger(err.code) ? err.code : 500;
  res.status(code).json({ error: err.message || "Server error" });
}

});

export default router;
``
