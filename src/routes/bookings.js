import { Router } from "express";
import { requireFields, parseDateTime } from "../utils/validate.js";
import {
  createCalendarEvent,
  hasCalendarConflict
} from "../services/googleCalendar.js";
import { db, admin } from "../services/firebase.js";

const router = Router();

function makeSlotId(start, end) {
  return `${start}_${end}`;
}

router.post("/", async (req, res) => {
  try {
    requireFields(req.body, [
      "name",
      "phone",
      "service",
      "barber",
      "start",
      "end"
    ]);

    const { name, phone, email, service, barber, notes, start, end } = req.body;

    const startDt = parseDateTime(start);
    const endDt = parseDateTime(end);

    if (endDt <= startDt) {
      return res.status(400).json({ error: "End time must be after start" });
    }

    const BUFFER_MINUTES = 1;
    const bufferedStart = new Date(startDt.getTime() - BUFFER_MINUTES * 60000);
    const bufferedEnd = new Date(endDt.getTime() + BUFFER_MINUTES * 60000);

    // (Optional) Google Calendar read check
    const conflict = await hasCalendarConflict({
      start: bufferedStart.toISOString(),
      end: bufferedEnd.toISOString()
    });

    if (conflict) {
      return res.status(409).json({
        error: "That time is already booked. Please choose another time."
      });
    }

    // 🔒 FIREBASE LOCK (THIS IS WHAT WAS MISSING)
    const slotId = makeSlotId(
      bufferedStart.toISOString(),
      bufferedEnd.toISOString()
    );

    const slotRef = db.collection("bookingLocks").doc(slotId);

    try {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(slotRef);
        if (snap.exists) {
          throw new Error("SLOT_ALREADY_BOOKED");
        }

        tx.set(slotRef, {
          start: bufferedStart.toISOString(),
          end: bufferedEnd.toISOString(),
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
    } catch (err) {
      if (err.message === "SLOT_ALREADY_BOOKED") {
        return res.status(409).json({
          error: "That time is already booked. Please choose another time."
        });
      }
      throw err;
    }

    // ✅ Create Google Calendar event
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

    let event;
    try {
      event = await createCalendarEvent({
        summary,
        description,
        start: startDt.toISOString(),
        end: endDt.toISOString(),
        timeZone: tz
      });
    } catch (err) {
      // rollback lock if calendar fails
      await slotRef.delete();
      throw err;
    }

    return res.json({
      ok: true,
      confirmation: event.id,
      eventLink: event.htmlLink
    });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
