    import { google } from "googleapis";

    export function calendarClient() {
      const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
      const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "";
      const privateKey = rawKey.includes("\n") ? rawKey.replace(/\n/g, "
") : rawKey;

      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/calendar.events"],
      });

      return google.calendar({ version: "v3", auth });
    }

    export async function createCalendarEvent({ summary, description, start, end, timeZone }) {
      const calendarId = process.env.GOOGLE_CALENDAR_ID;
      const cal = calendarClient();

      const res = await cal.events.insert({
        calendarId,
        requestBody: {
          summary,
          description,
          start: { dateTime: start, timeZone },
          end:   { dateTime: end,   timeZone },
          reminders: { useDefault: true }
        }
      });

      return res.data;
    }

export async function hasCalendarConflict({ start, end }) {
  const response = await calendar.events.list({
    calendarId: "primary", // or your shop calendar ID
    timeMin: start,
    timeMax: end,
    singleEvents: true,
    orderBy: "startTime"
  });

  const events = response.data.items || [];

  // Ignore all-day events, only block timed events
  return events.some(event => event.start?.dateTime);
}

