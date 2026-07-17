import { getAnnouncements } from "@/lib/api/queries";
import { AnnouncementRotator } from "./AnnouncementRotator";

/**
 * Thin site-wide bar showing the active announcements (for example holiday
 * closures). Renders nothing when there are none; with several, they rotate.
 * The data is fetched here on the server; AnnouncementRotator handles the
 * cycling on the client.
 */
export async function AnnouncementBar() {
  const announcements = await getAnnouncements();

  if (announcements.length === 0) return null;

  return <AnnouncementRotator announcements={announcements} />;
}
