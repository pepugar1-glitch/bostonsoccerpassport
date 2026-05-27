// Minimal .ics (iCalendar) generator. RFC 5545-ish — enough for Apple Calendar,
// Google Calendar, Outlook, and any other consumer calendar app to import.

export interface IcsEvent {
  uid: string;
  start: Date;        // local datetime
  durationMin: number;
  title: string;
  location?: string;
  description?: string;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toUtc(d: Date) {
  const utc = new Date(d.getTime());
  return (
    utc.getUTCFullYear().toString() +
    pad(utc.getUTCMonth() + 1) +
    pad(utc.getUTCDate()) +
    'T' +
    pad(utc.getUTCHours()) +
    pad(utc.getUTCMinutes()) +
    '00Z'
  );
}

function escapeIcs(s: string) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function buildIcs(events: IcsEvent[]): string {
  const now = toUtc(new Date());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Boston Soccer Passport//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Boston Soccer Passport',
  ];
  events.forEach((e) => {
    const end = new Date(e.start.getTime() + e.durationMin * 60 * 1000);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}@bostonsoccerpassport`,
      `DTSTAMP:${now}`,
      `DTSTART:${toUtc(e.start)}`,
      `DTEND:${toUtc(end)}`,
      `SUMMARY:${escapeIcs(e.title)}`,
      e.location ? `LOCATION:${escapeIcs(e.location)}` : '',
      e.description ? `DESCRIPTION:${escapeIcs(e.description)}` : '',
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  return lines.filter(Boolean).join('\r\n');
}

export function downloadIcs(filename: string, ics: string) {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
