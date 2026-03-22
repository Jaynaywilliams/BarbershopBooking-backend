import { google } from "googleapis";

const calendar = google.calendar("v3");

export async function createCalendarEvent({ summary, description, start, end, timeZone }) {
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";

  // Convert escaped \n into real newlines (Render stores ENV vars on one line)
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    privateKey,
    ["https://www.googleapis.com/auth/calendar"]

 );

  await auth.authorize();

  const event = {
    summary,
    description,
    start: { dateTime: start, timeZone },
    end: { dateTime: end, timeZone }
  };

  const res = await calendar.events.insert({
    auth,
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: event
  });

  return res.data;
}
``
