export type ItineraryStop = {
  time: string;
  title: string;
  description?: string;
};

const TIME_TITLE_RE = /^\s*([0-9]{1,2}:[0-9]{2})\s*-\s*([^:]+):?\s*(.*)$/;
const ADMIN_LINE_RE = /^\s*\d+\.\s*([^Жњ-]+?)\s*[Жњ]\s*([^:-]+?)(?:\s*-\s*(.*))?$/;

export function parseItinerary(text: string): ItineraryStop[] {
  if (!text) return [];
  const stops: ItineraryStop[] = [];
  text.split(/\r?\n/).forEach((line) => {
    const match = line.match(TIME_TITLE_RE);
    if (!match) return;
    const [, time, title, description] = match;
    stops.push({
      time: time.trim(),
      title: title.trim(),
      description: description?.trim() || undefined
    });
  });
  return stops;
}

export function parseAdminItinerary(text: string): ItineraryStop[] {
  if (!text) return [];
  const stops: ItineraryStop[] = [];
  text.split(/\r?\n/).forEach((line) => {
    const match = line.match(ADMIN_LINE_RE);
    if (!match) return;
    const [, duration, place, note] = match;
    stops.push({
      time: duration.trim(),
      title: place.trim(),
      description: note?.trim() || undefined
    });
  });
  return stops;
}
