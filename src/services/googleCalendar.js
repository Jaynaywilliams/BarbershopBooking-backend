import { google } from "googleapis";

function calendarClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "";

  const privateKey = rawKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"]
  });

  return google.calendar({ version: "v3", auth });
}

export async function hasCalendarConflict({ start, end }) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const cal = calendarClient();

  const response = await cal.freebusy.query({
    requestBody: {
      timeMin: start,
      timeMax: end,
      items: [{ id: calendarId }]
    }
  });

  const busy =
    response.data.calendars?.[calendarId]?.busy ?? [];

  return busy.length > 0;
}

export async function createCalendarEvent({
  summary,
  description,
  start,
  end,
  timeZone
}) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const cal = calendarClient();

  const res = await cal.events.insert({
    calendarId,
    requestBody: {
      summary,
      description,
      start: { dateTime: start, timeZone },
      end: { dateTime: end, timeZone },
      reminders: { useDefault: true }
    }
  });

  return res.data;
}
``
