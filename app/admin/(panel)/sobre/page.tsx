import { adminFetch } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { AboutUs } from "@/lib/api/types";
import { AboutForm } from "./AboutForm";

/**
 * Loads the singleton "Sobre" record. It does not exist until saved for the
 * first time, so a 404 is a valid "not filled in yet" state, not an error —
 * the form then starts empty.
 */
async function loadAbout(): Promise<AboutUs | null> {
  try {
    return await adminFetch<AboutUs>("/about-us");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export default async function AdminAboutPage() {
  const about = await loadAbout();

  return (
    <div className="max-w-3xl">
      <AboutForm about={about} />
    </div>
  );
}
