   import {
  createCalendarEvent,
  hasCalendarConflict
} from "../services/googleCalendar.js";


    const router = Router();

    router.post("/", async (req, res) => {
      try {
        requireFields(req.body, ["name", "phone", "service", "barber", "start", "end"]);
        const { name, phone, email, service, barber, notes, start, end } = req.body;

        const startDt = parseDateTime(start);
        const endDt   = parseDateTime(end);
        if (endDt <= startDt) return res.status(400).json({ error: "End time must be after start" });
      
const BUFFER_MINUTES = 1;

const bufferedStart = new Date(startDt.getTime() - BUFFER_MINUTES * 60000);
const bufferedEnd = new Date(endDt.getTime() + BUFFER_MINUTES * 60000);
   


const conflict = await hasCalendarConflict({
  start: bufferedStart.toISOString(),
  end: bufferedEnd.toISOString()
});

if (conflict) {
  console.log("⛔ CONFLICT — STOPPING BOOKING");
  return res.status(409).json({
    error: "That time is already booked. Please choose another time."
  });
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
        ].filter(Boolean).join("
");

       
const event = await createCalendarEvent({
  summary,
  description,
  start: startDt.toISOString(),
  end: endDt.toISOString(),
  timeZone: tz
});

if (!event || !event.id) {
  throw new Error("Calendar event was not created");
}

return res.json({
  ok: true,
  confirmation: event.id,
  eventLink: event.htmlLink
});

        
      } 
      catch (err) {
        const code = err.code && Number.isInteger(err.code) ? err.code : 500;
        console.error("Booking error:", err);
        res.status(code).json({ error: err.message || "Server error" });
      }
    });

    export default router;
