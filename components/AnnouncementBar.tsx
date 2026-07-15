import { getAnnouncements } from "@/lib/api/queries";

/**
 * Thin site-wide bar showing the most recent active announcement (for example a
 * holiday closure). Renders nothing when there are no active announcements.
 */
export async function AnnouncementBar() {
  const announcements = await getAnnouncements();
  const latest = announcements[0];

  if (!latest) return null;

  return (
    <div className="border-b border-accent/40 bg-accent-soft px-4 py-2 text-center text-sm text-accent-ink">
      <span className="font-semibold">{latest.title}:</span> {latest.message}
    </div>
  );
}
