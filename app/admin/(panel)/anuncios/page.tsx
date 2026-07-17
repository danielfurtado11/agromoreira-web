import { getAdminAnnouncements } from "@/lib/api/admin";
import { AnnouncementsManager } from "./AnnouncementsManager";

export default async function AdminAnnouncementsPage() {
  // Hidden announcements must be listed here too, so one switched off can be
  // switched back on — hence getAdminAnnouncements (include_inactive).
  const announcements = await getAdminAnnouncements();

  return (
    <div className="max-w-3xl">
      <AnnouncementsManager announcements={announcements} />
    </div>
  );
}
