// Google Calendar integration
// This file handles syncing study sessions to Google Calendar

export async function syncSessionToGoogleCalendar(params: {
  accessToken: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
}): Promise<{ eventId: string }> {
  if (!params.accessToken) {
    throw new Error("Google access token not available");
  }

  try {
    const event = {
      summary: params.title,
      description: params.description,
      start: {
        dateTime: params.startTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: params.endTime.toISOString(),
        timeZone: "UTC",
      },
      attendees: params.attendees?.map(email => ({ email })) || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 30 }, // 30 minutes before
        ],
      },
    };

    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { eventId: data.id };
  } catch (error) {
    console.error("Error syncing to Google Calendar:", error);
    throw error;
  }
}

export async function removeSessionFromGoogleCalendar(params: {
  accessToken: string;
  eventId: string;
}): Promise<void> {
  if (!params.accessToken) {
    throw new Error("Google access token not available");
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${params.eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error removing from Google Calendar:", error);
    throw error;
  }
}
